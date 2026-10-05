import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer as createHttpServer, request } from 'node:http';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer, loadConfigFromFile } from 'vite';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const configPath = fileURLToPath(new URL('../vite.config.mts', import.meta.url));

const withApiTarget = async (target, run) => {
    const previous = process.env.VITE_API_TARGET;
    process.env.VITE_API_TARGET = target;
    try { return await run(); }
    finally {
        if (previous === undefined) delete process.env.VITE_API_TARGET;
        else process.env.VITE_API_TARGET = previous;
    }
};

const loadDevelopmentConfig = async () => {
    const loaded = await loadConfigFromFile({ command: 'serve', mode: 'development' }, configPath, projectRoot, 'silent');
    assert.ok(loaded, 'Vite must load the project configuration');
    return loaded.config;
};

const sendRequest = (origin, path, method = 'GET', body = '') => new Promise((resolve, reject) => {
    const headers = body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } : {};
    const req = request(new URL(path, origin), { method, headers }, (res) => {
        let responseBody = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { responseBody += chunk; });
        res.on('end', () => {
            try { resolve({ status: res.statusCode, data: JSON.parse(responseBody) }); }
            catch (error) { reject(error); }
        });
        res.on('error', reject);
    });
    req.setTimeout(5000, () => req.destroy(new Error('Local proxy test request timed out')));
    req.on('error', reject);
    req.end(body);
});

test('development defaults to the API backend configured for production', async () => {
    // Empty shell value isolates the default from a developer's optional .env override.
    await withApiTarget('', async () => {
        const config = await loadDevelopmentConfig();
        const deployment = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
        const apiRewrite = deployment.rewrites.find((rule) => rule.source === '/api/:path*');
        assert.ok(apiRewrite, 'Production must have the existing API rewrite');
        assert.equal(config.server.proxy['/api'].target, apiRewrite.destination.replace('/:path*', ''));
    });
});

test('configured local backend receives account paths, queries, methods, and JSON bodies', { timeout: 15000 }, async (t) => {
    const backend = createHttpServer((req, res) => {
        let body = '';
        req.setEncoding('utf8');
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ method: req.method, path: req.url, host: req.headers.host, body, contentType: req.headers['content-type'] }));
        });
    });
    await new Promise((resolve, reject) => {
        backend.once('error', reject);
        backend.listen(0, '127.0.0.1', resolve);
    });
    t.after(() => new Promise((resolve, reject) => {
        backend.close((error) => error ? reject(error) : resolve());
        backend.closeAllConnections();
    }));

    const backendOrigin = `http://127.0.0.1:${backend.address().port}`;
    const config = await withApiTarget(backendOrigin, loadDevelopmentConfig);
    assert.equal(config.server.proxy['/api'].target, backendOrigin);

    // The actual Vite proxy runs with the explicit local override. No production request is made.
    const vite = await createViteServer({
        ...config,
        configFile: false,
        root: projectRoot,
        logLevel: 'silent',
        appType: 'custom',
        plugins: [],
        optimizeDeps: { noDiscovery: true, include: [] },
        server: { ...config.server, host: '127.0.0.1', port: 0, strictPort: true, hmr: false, watch: null },
    });
    t.after(() => vite.close());
    await vite.listen();
    const frontendOrigin = `http://127.0.0.1:${vite.httpServer.address().port}`;
    const backendHost = new URL(backendOrigin).host;

    for (const path of ['/api/plants', '/api/users', '/api/plants/fixture-plant?include=notes&search=a%20b']) {
        const response = await sendRequest(frontendOrigin, path);
        assert.equal(response.status, 200);
        assert.equal(response.data.method, 'GET');
        assert.equal(response.data.path, path.slice(4));
        assert.equal(response.data.host, backendHost);
    }

    const body = JSON.stringify({ plant_name: 'Local test plant', user_id: 'fixture-user' });
    const updated = await sendRequest(frontendOrigin, '/api/plants/fixture-plant', 'PUT', body);
    assert.equal(updated.status, 200);
    assert.equal(updated.data.method, 'PUT');
    assert.equal(updated.data.path, '/plants/fixture-plant');
    assert.equal(updated.data.body, body);
    assert.equal(updated.data.contentType, 'application/json');

    const deleted = await sendRequest(frontendOrigin, '/api/plants/fixture-plant', 'DELETE');
    assert.equal(deleted.status, 200);
    assert.equal(deleted.data.method, 'DELETE');
    assert.equal(deleted.data.path, '/plants/fixture-plant');
});

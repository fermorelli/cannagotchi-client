import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

// Execute the real provider callbacks with inert hook/Firebase adapters. No DOM,
// Firebase connection, account credentials, or API records are used by these tests.
const adapterKey = 'cannagotchi-test:auth-provider';
const adapters = {
    react: `
        const harness = () => globalThis[Symbol.for('${adapterKey}')];
        export const createContext = () => ({ Provider: 'AuthProvider' });
        export const useContext = () => null;
        export const useState = (initial) => {
            const state = harness();
            const index = state.cursor++;
            if (!Object.hasOwn(state.slots, index)) state.slots[index] = typeof initial === 'function' ? initial() : initial;
            return [state.slots[index], (next) => { state.slots[index] = typeof next === 'function' ? next(state.slots[index]) : next; }];
        };
        export const useRef = (initial) => {
            const state = harness();
            const index = state.cursor++;
            if (!Object.hasOwn(state.slots, index)) state.slots[index] = { current: initial };
            return state.slots[index];
        };
        export const useCallback = (callback) => callback;
        export const useEffect = (effect) => { harness().effects.push(effect); };
    `,
    'react/jsx-runtime': 'export const jsx = (type, props) => ({ type, props }); export const jsxs = jsx;',
    'firebase/auth': `
        export const onAuthStateChanged = (auth, callback) => {
            globalThis[Symbol.for('${adapterKey}')].authChanged = callback;
            return () => {};
        };
        export const createUserWithEmailAndPassword = () => { throw new Error('Not part of this test'); };
        export const signInWithEmailAndPassword = createUserWithEmailAndPassword;
        export const signOut = createUserWithEmailAndPassword;
    `,
    '../firebase/firebase': 'export const auth = {};',
};

const bundled = await build({
    entryPoints: [fileURLToPath(new URL('../src/context/authContext.jsx', import.meta.url))],
    bundle: true, write: false, format: 'esm', platform: 'node', jsx: 'automatic', logLevel: 'silent',
    plugins: [{
        name: 'inert-provider-test-adapters',
        setup(builder) {
            builder.onResolve({ filter: /^(react(?:\/jsx-runtime)?|firebase\/auth|\.\.\/firebase\/firebase)$/ }, ({ path }) => ({ path, namespace: 'provider-adapter' }));
            builder.onLoad({ filter: /.*/, namespace: 'provider-adapter' }, ({ path }) => ({ contents: adapters[path], loader: 'js' }));
        },
    }],
});
const { AuthProvider } = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);

const profile = { _id: 'test-owner', email: 'owner@example.test' };
const plant = { _id: 'test-plant', user_id: profile._id, plant_name: 'Test plant' };
const jsonResponse = (data) => ({ ok: true, status: 200, json: async () => ({ error: false, data }) });
const deferred = () => {
    let resolve;
    let reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    return { promise, resolve, reject };
};

async function openAccount(t) {
    const key = Symbol.for(adapterKey);
    const previous = [key, 'fetch', 'localStorage', 'window'].map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]);
    const state = { cursor: 0, slots: [], effects: [], authChanged: null };
    globalThis[key] = state;
    globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
    globalThis.window = { addEventListener: () => {}, removeEventListener: () => {} };
    globalThis.fetch = async (path) => jsonResponse(path === '/api/users' ? [profile] : [plant]);
    t.after(() => {
        for (const [name, descriptor] of previous) {
            if (descriptor) Object.defineProperty(globalThis, name, descriptor);
            else delete globalThis[name];
        }
    });
    const render = () => {
        state.cursor = 0;
        state.effects = [];
        return AuthProvider({ children: null }).props.value;
    };
    render();
    state.effects[0](); // Subscribe to the controlled authentication adapter.
    state.authChanged({ uid: 'test-firebase-owner', email: profile.email });
    await render().retryData();
    return { render, state };
}

test('a successful deletion cannot be undone by an older collection refresh', async (t) => {
    const { render } = await openAccount(t);
    const users = deferred();
    const plants = deferred();
    const deletion = deferred();
    globalThis.fetch = (path, options) => options.method === 'DELETE' ? deletion.promise : path === '/api/users' ? users.promise : plants.promise;
    const refresh = render().retryData();
    assert.equal(render().loadingData, true);
    const removed = render().deletePlant(plant._id);
    deletion.resolve(jsonResponse(null));
    await removed;
    assert.deepEqual(render().plants, []);
    assert.equal(render().loadingData, false);
    users.resolve(jsonResponse([profile]));
    plants.resolve(jsonResponse([plant]));
    await refresh;
    assert.deepEqual(render().plants, [], 'The stale response must not resurrect the harvested plant');
});

test('an older refresh failure cannot hide a successfully deleted plant behind a service error', async (t) => {
    const { render } = await openAccount(t);
    const users = deferred();
    const plants = deferred();
    globalThis.fetch = (path, options) => options.method === 'DELETE' ? Promise.resolve(jsonResponse(null)) : path === '/api/users' ? users.promise : plants.promise;
    const refresh = render().retryData();
    await render().deletePlant(plant._id);
    users.reject(new TypeError('Network unavailable'));
    plants.resolve(jsonResponse([plant]));
    await refresh;
    assert.deepEqual(render().plants, []);
    assert.equal(render().dataError, '');
    assert.equal(render().loadingData, false);
});

test('a confirmed deletion clears an error from a refresh that already failed', async (t) => {
    const { render } = await openAccount(t);
    globalThis.fetch = async () => { throw new TypeError('Network unavailable'); };
    await render().retryData();
    assert.match(render().dataError, /Could not reach/);
    globalThis.fetch = async () => jsonResponse(null);
    await render().deletePlant(plant._id);
    assert.equal(render().dataError, '');
    assert.deepEqual(render().plants, []);
});

test('failed deletion preserves the plant and lets a valid in-flight refresh finish', async (t) => {
    const { render } = await openAccount(t);
    const users = deferred();
    const plants = deferred();
    globalThis.fetch = (path, options) => options.method === 'DELETE' ? Promise.reject(new TypeError('Network unavailable')) : path === '/api/users' ? users.promise : plants.promise;
    const refresh = render().retryData();
    await assert.rejects(render().deletePlant(plant._id), /Could not reach/);
    assert.deepEqual(render().plants, [plant]);
    assert.equal(render().loadingData, true);
    users.resolve(jsonResponse([profile]));
    plants.resolve(jsonResponse([plant]));
    await refresh;
    assert.deepEqual(render().plants, [plant]);
    assert.equal(render().loadingData, false);
});

test('deletion rejects a foreign plant before making a request', async (t) => {
    const { render } = await openAccount(t);
    let requests = 0;
    globalThis.fetch = async () => { requests += 1; return jsonResponse(null); };
    await assert.rejects(render().deletePlant('another-owners-plant'), /not in your collection/);
    assert.equal(requests, 0);
    assert.deepEqual(render().plants, [plant]);
});

test('a pending deletion cannot replace the next authenticated workspace', async (t) => {
    const { render, state } = await openAccount(t);
    const deletion = deferred();
    globalThis.fetch = () => deletion.promise;
    const removed = render().deletePlant(plant._id);
    state.authChanged({ uid: 'test-other-account', email: 'other@example.test' });
    const secondProfile = { _id: 'second-owner', email: 'other@example.test' };
    const secondPlant = { ...plant, _id: 'second-plant', user_id: secondProfile._id };
    globalThis.fetch = async (path) => jsonResponse(path === '/api/users' ? [secondProfile] : [secondPlant]);
    await render().retryData();
    deletion.resolve(jsonResponse(null));
    await assert.rejects(removed, /workspace changed/);
    assert.deepEqual(render().plants, [secondPlant]);
    assert.equal(render().authUser._id, secondProfile._id);
});

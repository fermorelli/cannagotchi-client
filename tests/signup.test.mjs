import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { createAccount } from '../src/components/signup/createAccount.mjs';

// Load the real Vite schemas with the installed Joi package, without Firebase or a DOM.
const require = createRequire(import.meta.url);
async function loadSchema(path) {
    const source = (await readFile(new URL(path, import.meta.url), 'utf8')).replace("from 'joi'", `from '${pathToFileURL(require.resolve('joi')).href}'`);
    return (await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)).schema;
}
const schema = await loadSchema('../src/components/signup/validation.js');
const loginSchema = await loadSchema('../src/components/login/validation.js');
const values = { firstName: 'Alex', lastName: 'Rivera', email: 'qa@example.test', password: 'a unique garden phrase', confirmPassword: 'a unique garden phrase' };
const response = (data, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => data });

test('signup requires exact password confirmation, including after the original changes', () => {
    for (const confirmPassword of ['', undefined, 'another unique phrase']) {
        assert.equal(schema.validate({ ...values, confirmPassword }).error.details[0].path[0], 'confirmPassword');
    }
    assert.equal(schema.validate(values).error, undefined);
    assert.equal(schema.validate({ ...values, password: 'a different garden phrase' }).error.details[0].path[0], 'confirmPassword');
});

test('signup rejects short, oversized and whitespace-only passwords', () => {
    for (const password of ['short password', 'x'.repeat(129), ' '.repeat(20)]) {
        assert.equal(schema.validate({ ...values, password, confirmPassword: password }).error.details[0].path[0], 'password');
    }
});

test('long passphrases preserve spaces and remain compatible with login', () => {
    const password = `  ${'garden '.repeat(16)}  `;
    const result = schema.validate({ ...values, email: ' QA@Example.Test ', firstName: ' Alex ', password, confirmPassword: password });
    assert.equal(result.error, undefined);
    assert.equal(result.value.password, password);
    assert.equal(result.value.confirmPassword, password);
    assert.equal(result.value.email, 'qa@example.test');
    assert.equal(result.value.firstName, 'Alex');
    assert.equal(loginSchema.validate({ email: result.value.email, password }).error, undefined);
    assert.equal(schema.validate({ ...values, password: 'x'.repeat(128), confirmPassword: 'x'.repeat(128) }).error, undefined);
});

test('signup bounds profile fields and requires letters in names', () => {
    for (const firstName of ['--', '  ', 'a'.repeat(101)]) assert.ok(schema.validate({ ...values, firstName }).error);
    assert.equal(schema.validate({ ...values, firstName: 'José', lastName: "O’Neil".replace('’', "'") }).error, undefined);
    assert.ok(schema.validate({ ...values, email: `${'a'.repeat(250)}@example.test` }).error);
});

function harness(overrides = {}) {
    const createdUser = { uid: 'qa-created-user' };
    const calls = { auth: [], profiles: [], removed: [] };
    const state = { user: createdUser };
    const dependencies = {
        registerAccount: async (...args) => { calls.auth.push(args); return { user: createdUser }; },
        removeAccount: async (user) => { calls.removed.push(user); },
        currentUser: () => state.user,
        fetchProfile: async (path, options) => { calls.profiles.push({ path, options }); return response({ error: false }); },
        ...overrides,
    };
    return { createdUser, calls, state, dependencies };
}

test('signup sends passwords only to auth and explicitly whitelists profile fields', async () => {
    const { createdUser, calls, dependencies } = harness();
    assert.equal(await createAccount({ ...values, role: 'admin' }, dependencies), createdUser);
    assert.deepEqual(calls.auth, [[values.email, values.password]]);
    assert.equal(calls.profiles[0].path, '/api/users');
    assert.deepEqual(JSON.parse(calls.profiles[0].options.body), { firstName: values.firstName, lastName: values.lastName, email: values.email });
    assert.deepEqual(calls.profiles[0].options.headers, { 'Content-Type': 'application/json' });
    assert.equal(calls.removed.length, 0);
});

test('a misleading success body with an HTTP rejection cannot report signup success', async () => {
    const { createdUser, calls, dependencies } = harness({ fetchProfile: async () => response({ error: false }, 400) });
    await assert.rejects(createAccount(values, dependencies), { code: 'signup/profile-rejected' });
    assert.deepEqual(calls.removed, [createdUser]);
});

test('an explicit profile rejection rolls back the exact credential user', async () => {
    const { createdUser, calls, dependencies } = harness({ fetchProfile: async () => response({ error: true }, 503) });
    await assert.rejects(createAccount(values, dependencies), { code: 'signup/profile-rejected' });
    assert.equal(calls.removed[0], createdUser);
});

test('rollback failure identifies the existing sign-in account instead of suggesting blind retry', async () => {
    const { dependencies } = harness({ fetchProfile: async () => response({ error: true }), removeAccount: async () => { throw new Error('offline'); } });
    await assert.rejects(createAccount(values, dependencies), { code: 'signup/rollback-failed', accountCreated: true });
});

test('ambiguous profile responses preserve auth rather than deleting a possibly complete account', async () => {
    for (const fetchProfile of [
        async () => { throw new TypeError('network lost'); },
        async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('bad JSON'); } }),
        async () => response({}, 200),
        async () => response({ error: false }, 500),
    ]) {
        const { calls, dependencies } = harness({ fetchProfile });
        await assert.rejects(createAccount(values, dependencies), { code: 'signup/profile-unconfirmed', accountCreated: true });
        assert.equal(calls.removed.length, 0);
    }
});

test('profile requests time out without deleting an account whose write may have succeeded', async () => {
    let aborted = false;
    const { calls, dependencies } = harness({ timeoutMs: 10, fetchProfile: (path, { signal }) => new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => { aborted = true; reject(Object.assign(new Error('aborted'), { name: 'AbortError' })); }, { once: true });
    }) });
    await assert.rejects(createAccount(values, dependencies), { code: 'signup/profile-unconfirmed', accountCreated: true });
    assert.equal(aborted, true);
    assert.equal(calls.removed.length, 0);
});

test('an auth failure makes no profile or deletion request', async () => {
    const { calls, dependencies } = harness({ registerAccount: async () => { throw Object.assign(new Error('busy'), { code: 'auth/too-many-requests' }); } });
    await assert.rejects(createAccount(values, dependencies), { code: 'auth/too-many-requests' });
    assert.equal(calls.profiles.length, 0);
    assert.equal(calls.removed.length, 0);
});

test('a changed session before the profile request prevents writes and rollback', async () => {
    const { calls, state, dependencies } = harness();
    state.user = { uid: 'other-user' };
    await assert.rejects(createAccount(values, dependencies), { code: 'signup/session-changed' });
    assert.equal(calls.profiles.length, 0);
    assert.equal(calls.removed.length, 0);
});

test('a session change during the profile request skips rollback', async () => {
    for (const data of [{ error: true }, { error: false }]) {
        const { calls, state, dependencies } = harness();
        dependencies.fetchProfile = async () => { state.user = { uid: 'other-user' }; return response(data); };
        await assert.rejects(createAccount(values, dependencies), { code: 'signup/session-changed' });
        assert.equal(calls.removed.length, 0);
    }
});

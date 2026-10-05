import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Import Vite's ESM source without adding a test dependency or changing package type.
const source = await readFile(new URL('./localGarden.js', import.meta.url), 'utf8');
const {
    LOCAL_GARDEN_ID, LOCAL_GARDEN_KEY, createExamplePlants, isLocalGardenActive,
    localGardenProfile, localGardenUser, newLocalPlantId, readLocalPlants,
    saveLocalPlants, setLocalGardenActive,
} = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

const memoryStorage = (t, initialEntries = []) => {
    const records = new Map(initialEntries);
    const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    const storage = {
        getItem: (key) => records.get(key) ?? null,
        setItem: (key, value) => records.set(key, String(value)),
        removeItem: (key) => records.delete(key),
    };
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, writable: true, value: storage });
    t.after(() => {
        if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
        else delete globalThis.localStorage;
    });
    return { records, storage };
};

test('first local collection is seeded once with distinct stages relative to today', (t) => {
    const { records } = memoryStorage(t);
    assert.equal(isLocalGardenActive(), false);
    const plants = readLocalPlants();
    assert.deepEqual(plants.map(({ plant_name }) => plant_name), ['Luna', 'Sol', 'Menta']);
    assert.equal(new Set(plants.map(({ _id }) => _id)).size, 3);
    const noonToday = new Date();
    noonToday.setHours(12, 0, 0, 0);
    assert.deepEqual(plants.map(({ germination_date }) => {
        const noonStarted = new Date(`${germination_date}T12:00:00`);
        return Math.round((noonToday - noonStarted) / 86400000);
    }), [9, 42, 108]);
    assert.deepEqual(readLocalPlants(), plants);
    assert.equal(JSON.parse(records.get(LOCAL_GARDEN_KEY)).version, 1);
    // Seeding data alone never opts the visitor into demo mode.
    assert.equal(isLocalGardenActive(), false);
});

test('created and edited local records survive a fresh read with stable IDs', (t) => {
    memoryStorage(t);
    const plants = readLocalPlants();
    const id = newLocalPlantId();
    const created = { ...plants[0], _id: id, plant_name: 'New plant' };
    saveLocalPlants([...plants, created]);
    assert.deepEqual(readLocalPlants().find((plant) => plant._id === id), created);
    const edited = { ...created, plant_name: 'Edited plant', auto: true, grow_mode: 'Exterior' };
    saveLocalPlants(readLocalPlants().map((plant) => plant._id === id ? edited : plant));
    assert.deepEqual(readLocalPlants().find((plant) => plant._id === id), edited);
    saveLocalPlants(readLocalPlants().filter((plant) => plant._id !== id));
    assert.equal(readLocalPlants().some((plant) => plant._id === id), false);
});

test('a deliberately empty collection stays empty instead of recreating examples', (t) => {
    const { records } = memoryStorage(t);
    readLocalPlants();
    saveLocalPlants([]);
    const saved = records.get(LOCAL_GARDEN_KEY);
    assert.deepEqual(readLocalPlants(), []);
    assert.deepEqual(readLocalPlants(), []);
    assert.equal(records.get(LOCAL_GARDEN_KEY), saved);
});

test('malformed JSON and invalid schemas preserve their saved bytes', (t) => {
    const { records } = memoryStorage(t);
    const example = createExamplePlants()[0];
    const invalid = [
        '{broken JSON',
        'null',
        JSON.stringify({ version: 2, plants: [] }),
        JSON.stringify({ version: 1, plants: 'not an array' }),
        JSON.stringify({ version: 1, plants: [null] }),
        JSON.stringify({ version: 1, plants: [example, example] }),
        JSON.stringify({ version: 1, plants: [{ ...example, plant_name: 123 }] }),
    ];
    for (const bytes of invalid) {
        records.set(LOCAL_GARDEN_KEY, bytes);
        assert.throws(() => readLocalPlants(), /kept unchanged/);
        assert.equal(records.get(LOCAL_GARDEN_KEY), bytes);
    }
});

test('quota failure throws without pretending new or changed records were saved', (t) => {
    const { records, storage } = memoryStorage(t);
    const normalWrite = storage.setItem;
    storage.setItem = () => { throw new Error('QuotaExceededError'); };
    assert.throws(() => readLocalPlants(), /could not be saved/);
    assert.equal(records.has(LOCAL_GARDEN_KEY), false);
    storage.setItem = normalWrite;
    const plants = readLocalPlants();
    const saved = records.get(LOCAL_GARDEN_KEY);
    storage.setItem = () => { throw new Error('QuotaExceededError'); };
    assert.throws(() => saveLocalPlants([{ ...plants[0], plant_name: 'Unsaved edit' }]), /could not be saved/);
    assert.equal(records.get(LOCAL_GARDEN_KEY), saved);
    assert.deepEqual(readLocalPlants(), plants);
    assert.throws(() => setLocalGardenActive(true), /storage is unavailable/);
    assert.equal(isLocalGardenActive(), false);
});

test('explicit local mode entry and exit leave both saved plants and account storage intact', (t) => {
    const accountKey = 'firebase:authUser:unrelated-account';
    const accountBytes = '{"uid":"account-user-123"}';
    const { records } = memoryStorage(t, [[accountKey, accountBytes]]);
    const plants = readLocalPlants();
    const savedPlants = records.get(LOCAL_GARDEN_KEY);
    setLocalGardenActive(true);
    assert.equal(isLocalGardenActive(), true);
    setLocalGardenActive(false);
    assert.equal(isLocalGardenActive(), false);
    assert.equal(records.get(accountKey), accountBytes);
    assert.equal(records.get(LOCAL_GARDEN_KEY), savedPlants);
    assert.deepEqual(readLocalPlants(), plants);
});

test('local owner and plant IDs are isolated from account-owned records', (t) => {
    const { records } = memoryStorage(t);
    const plants = readLocalPlants();
    assert.equal(localGardenUser.uid, LOCAL_GARDEN_ID);
    assert.equal(localGardenProfile._id, LOCAL_GARDEN_ID);
    assert.ok(plants.every((plant) => plant.user_id === LOCAL_GARDEN_ID && plant._id.startsWith('local-')));
    const ids = Array.from({ length: 32 }, newLocalPlantId);
    assert.equal(new Set(ids).size, ids.length);
    assert.ok(ids.every((id) => id.startsWith('local-') && id !== LOCAL_GARDEN_ID));
    const foreignBytes = JSON.stringify({ version: 1, plants: [{ ...plants[0], user_id: 'account-user-123' }] });
    records.set(LOCAL_GARDEN_KEY, foreignBytes);
    assert.throws(() => readLocalPlants(), /kept unchanged/);
    assert.equal(records.get(LOCAL_GARDEN_KEY), foreignBytes);
});

test('blocked browser storage produces a recoverable error and does not activate demo', (t) => {
    const { storage } = memoryStorage(t);
    storage.getItem = () => { throw new Error('SecurityError'); };
    assert.equal(isLocalGardenActive(), false);
    assert.throws(() => readLocalPlants(), /storage is unavailable/);
    storage.removeItem = () => { throw new Error('SecurityError'); };
    assert.throws(() => setLocalGardenActive(false), /storage is unavailable/);
});

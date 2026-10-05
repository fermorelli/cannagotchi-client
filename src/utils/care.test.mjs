import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// The existing Vite project has no package-wide ESM setting or test runner dependency.
const source = await readFile(new URL('./care.js', import.meta.url), 'utf8');
const { createCareEntry, emptyCareJournal, getCareStorageKey, getCareSummary, sanitizeCareJournal } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const now = new Date('2026-10-05T15:00:00.000Z');

test('records real care with an explicit event time and optional note', () => {
    const entry = createCareEntry({ type: 'water', note: '  250 ml  ', date: '2026-10-04T12:00:00Z' }, now);
    assert.equal(entry.type, 'water');
    assert.equal(entry.note, '250 ml');
    assert.equal(entry.occurredAt, '2026-10-04T12:00:00.000Z');
    assert.equal(entry.createdAt, now.toISOString());
    assert.equal(typeof entry.id, 'string');
});

test('rejects invented future activity, empty observations, and invalid measurements', () => {
    assert.throws(() => createCareEntry({ type: 'water', date: '2026-10-07T12:00:00Z' }, now), /already happened/);
    assert.throws(() => createCareEntry({ type: 'note', note: ' ' }, now), /observation/);
    assert.throws(() => createCareEntry({ type: 'measurement', height: 0 }, now), /height/);
    assert.throws(() => createCareEntry({ type: 'measurement', height: 'nope' }, now), /height/);
    assert.throws(() => createCareEntry({ type: 'unknown' }, now), /type/);
    assert.equal(createCareEntry({ type: 'measurement', height: '24.5' }, now).height, 24.5);
});

test('care summary is based on user logs and omits future records', () => {
    const old = createCareEntry({ type: 'water', date: '2026-09-01T12:00:00Z' }, now);
    const recent = createCareEntry({ type: 'measurement', height: 31, date: '2026-10-04T12:00:00Z' }, now);
    const summary = getCareSummary([old, recent, { ...old, occurredAt: '2030-01-01T00:00:00Z' }], now);
    assert.equal(summary.loggedRecently, true);
    assert.equal(summary.lastEntry.id, recent.id);
    assert.equal(summary.entryCount, 2);
    assert.equal(summary.lastWatered.id, old.id);
    assert.equal(getCareSummary([old], now).loggedRecently, false);
    assert.equal(getCareSummary([], now).lastEntry, null);
});

test('sanitizes corrupt storage, sorts logs, and accepts only known visual stages', () => {
    const recent = createCareEntry({ type: 'note', note: 'New leaves' }, now);
    const older = createCareEntry({ type: 'water', date: '2026-09-01T12:00:00Z' }, now);
    const journal = sanitizeCareJournal({
        entries: { plantA: [null, { ...older, occurredAt: 'bad date' }, older, recent], plantB: 'corrupt' },
        stages: { plantA: 'flowering', plantB: 'unknown', plantC: 'auto' },
    });
    assert.deepEqual(journal.entries.plantA.map(({ id }) => id), [recent.id, older.id]);
    assert.equal(journal.entries.plantB, undefined);
    assert.deepEqual(journal.stages, { plantA: 'flowering' });
    assert.deepEqual(sanitizeCareJournal(null), emptyCareJournal());
});

test('browser journal storage is scoped separately to each user', () => {
    assert.notEqual(getCareStorageKey('user-one'), getCareStorageKey('user-two'));
    assert.equal(getCareStorageKey('a/b'), 'cannagotchi:care:v1:a%2Fb');
});

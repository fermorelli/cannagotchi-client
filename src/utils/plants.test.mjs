import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('./plants.js', import.meta.url), 'utf8');
const { formatPlantDate, getPlantAgeInDays, getEstimatedHarvestDate, getDaysUntilHarvest, isAutoflower } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

const inTimeZone = (zone, run) => {
    const previous = process.env.TZ;
    process.env.TZ = zone;
    try { run(); }
    finally {
        if (previous === undefined) delete process.env.TZ;
        else process.env.TZ = previous;
    }
};

const atTime = (iso, run) => {
    const original = Date.now;
    Date.now = () => new Date(iso).getTime();
    try { run(); }
    finally { Date.now = original; }
};

test('date-only and UTC midnight germination dates keep their recorded day in Argentina', () => {
    inTimeZone('America/Argentina/Buenos_Aires', () => {
        assert.equal(formatPlantDate('2026-10-05'), '05/10/2026');
        assert.equal(formatPlantDate('2026-10-05T00:00:00.000Z'), '05/10/2026');
        assert.equal(formatPlantDate('2026-10-05T00:00:00+00:00'), '05/10/2026');
        assert.equal(formatPlantDate('2026-10-05', 'en-US'), '10/5/2026');
        assert.equal(formatPlantDate('2026-02-30'), 'Not set');
        assert.equal(formatPlantDate('invalid'), 'Not set');
        assert.equal(formatPlantDate(null), 'Not set');
    });
});

test('plant age counts local calendar days and clamps future or missing dates', () => {
    inTimeZone('America/Argentina/Buenos_Aires', () => {
        atTime('2026-10-05T03:01:00Z', () => {
            assert.equal(getPlantAgeInDays('2026-10-04'), 1);
            assert.equal(getPlantAgeInDays('2026-10-04T00:00:00.000Z'), 1);
            assert.equal(getPlantAgeInDays('2026-10-05'), 0);
            assert.equal(getPlantAgeInDays('2026-10-06'), 0);
            assert.equal(getPlantAgeInDays('invalid'), 0);
            assert.equal(getPlantAgeInDays(null), 0);
        });
        atTime('2026-10-05T02:59:00Z', () => {
            assert.equal(getPlantAgeInDays('2026-10-04'), 0);
        });
    });
});

test('plant age counts a spring DST day despite its 23 elapsed hours', () => {
    inTimeZone('America/New_York', () => {
        atTime('2026-03-09T04:01:00Z', () => {
            assert.equal(getPlantAgeInDays('2026-03-08'), 1);
        });
    });
});

test('harvest estimates add calendar days and preserve local date rendering', () => {
    inTimeZone('America/Argentina/Buenos_Aires', () => {
        const dates = [
            ['Indica', '03/04/2027'],
            ['Sativa', '13/05/2027'],
            ['Indica-dominating breed', '13/04/2027'],
            ['Sativa-dominating breed', '23/04/2027'],
        ];
        for (const [genetic, expected] of dates) {
            const date = getEstimatedHarvestDate({ genetic, germination_date: '2026-10-05T00:00:00.000Z' });
            assert.equal(formatPlantDate(date), expected);
            assert.equal(date.getHours(), 0);
        }
        assert.equal(getEstimatedHarvestDate({ genetic: 'Unknown', germination_date: '2026-10-05' }), null);
        assert.equal(getEstimatedHarvestDate({ genetic: 'Indica', germination_date: 'invalid' }), null);
        atTime('2027-04-03T15:00:00Z', () => {
            const plant = { genetic: 'Indica', germination_date: '2026-10-05' };
            assert.equal(getDaysUntilHarvest(plant), 0);
        });
    });
    inTimeZone('America/New_York', () => {
        const date = getEstimatedHarvestDate({ genetic: 'Indica', germination_date: '2026-01-01' });
        assert.equal(formatPlantDate(date), '30/06/2026');
        assert.equal(date.getHours(), 0);
    });
});

test('autoflower recognizes existing boolean and legacy form values', () => {
    for (const value of [true, 'true', 'on', 1, '1']) assert.equal(isAutoflower(value), true);
    for (const value of [false, 'false', 'off', 0, '0', '', null, undefined]) assert.equal(isAutoflower(value), false);
});

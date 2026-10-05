import test from 'node:test';
import assert from 'node:assert/strict';
import { COLS, ROWS, SPOTS, EMPTY_POT, keyFor, distance, getGardenPageCount, getGardenPageForPlant, getGardenPlantRange, getGardenObjects, makeObstacles, pathToObject } from './worldModel.mjs';
import { createHeldMovement, INITIAL_MOVE_DELAY, HELD_MOVE_INTERVAL } from './movement.mjs';

const start = { x: 10, y: 9 };

test('the caretaker can visit every planting spot and the empty pot without crossing scenery', () => {
    const obstacles = makeObstacles();
    assert.equal(obstacles.has(keyFor(start.x, start.y)), false);
    for (const object of [...SPOTS, EMPTY_POT]) {
        const path = pathToObject(start, object, obstacles);
        assert.ok(path, `No visit path to ${keyFor(object.x, object.y)}`);
        let previous = start;
        for (const tile of path) {
            assert.equal(distance(previous, tile), 1, 'Movement must take one cardinal step at a time');
            assert.equal(obstacles.has(keyFor(tile.x, tile.y)), false, 'The route must avoid solid scenery');
            assert.ok(tile.x > 0 && tile.x < COLS - 1 && tile.y > 0 && tile.y < ROWS - 1);
            previous = tile;
        }
        assert.equal(distance(previous, object), 1, 'The route ends beside the plant instead of inside its pot');
    }
});

test('pond, greenhouse, pots and world edges are solid while the main path is open', () => {
    const obstacles = makeObstacles();
    for (const [x, y] of [[4, 2], [2, 10], [4, 6], [16, 10], [0, 8], [19, 8], [10, 0], [10, 12]]) assert.equal(obstacles.has(keyFor(x, y)), true);
    for (const [x, y] of [[6, 4], [6, 5], [10, 8], [10, 9], [10, 11], [16, 9]]) assert.equal(obstacles.has(keyFor(x, y)), false);
});

test('adjacent visits require no movement and blocked destinations fail without a route', () => {
    const obstacles = makeObstacles();
    assert.deepEqual(pathToObject({ x: 16, y: 9 }, EMPTY_POT, obstacles), []);
    const surrounded = new Set([...obstacles, keyFor(15, 10), keyFor(17, 10), keyFor(16, 9), keyFor(16, 11)]);
    assert.equal(pathToObject(start, EMPTY_POT, surrounded), null);
});

test('larger collections appear exactly once across patches with an empty pot on every patch', () => {
    const plants = Array.from({ length: 19 }, (_, i) => ({ _id: `plant-${i}`, plant_name: `Plant ${i}` }));
    assert.equal(getGardenPageCount(plants.length), 4);
    const collected = [];
    for (let page = 0; page < getGardenPageCount(plants.length); page += 1) {
        const objects = getGardenObjects(plants, page);
        assert.equal(objects.filter((object) => object.empty).length, 1);
        assert.ok(objects.length <= 7);
        collected.push(...objects.filter((object) => !object.empty).map((object) => object.id));
    }
    assert.deepEqual(collected, plants.map((plant) => plant._id));
    assert.deepEqual(getGardenObjects(plants, 99), getGardenObjects(plants, 3));
    assert.deepEqual(getGardenObjects(plants, -1), getGardenObjects(plants, 0));
});

test('a new empty garden still has one playable patch and the plant creation pot', () => {
    assert.equal(getGardenPageCount(0), 1);
    assert.deepEqual(getGardenObjects([]), [EMPTY_POT]);
});

test('seven plants have explicit ranges and every selected plant resolves to its garden', () => {
    const plants = Array.from({ length: 7 }, (_, i) => ({ _id: `plant-${i}` }));
    assert.equal(getGardenPageCount(plants.length), 2);
    assert.deepEqual(getGardenPlantRange(7, 0), { first: 1, last: 6, total: 7 });
    assert.deepEqual(getGardenPlantRange(7, 1), { first: 7, last: 7, total: 7 });
    for (const [index, plant] of plants.entries()) {
        const page = getGardenPageForPlant(plants, plant._id);
        assert.equal(page, index < 6 ? 0 : 1);
        assert.ok(getGardenObjects(plants, page).some((object) => object.id === plant._id));
    }
    assert.equal(getGardenPageForPlant(plants, 'missing'), -1);
    assert.equal(getGardenPageForPlant(plants, null), -1);
});

test('harvesting the last plant in a garden clamps its visible range and contents', () => {
    for (const remaining of [6, 12]) {
        const plants = Array.from({ length: remaining }, (_, i) => ({ _id: `plant-${i}` }));
        const removedPage = getGardenPageCount(remaining + 1) - 1;
        const expectedPage = getGardenPageCount(remaining) - 1;
        assert.deepEqual(getGardenObjects(plants, removedPage), getGardenObjects(plants, expectedPage));
        assert.deepEqual(getGardenPlantRange(remaining, removedPage), { first: remaining - 5, last: remaining, total: remaining });
    }
    assert.deepEqual(getGardenPlantRange(0, 1), { first: 0, last: 0, total: 0 });
});

test('a short movement tap takes exactly one step regardless of polling phase or OS repeats', () => {
    const movement = createHeldMovement();
    const direction = [0, -1, 'up'];
    assert.deepEqual(movement.press('key:w', direction, 120), direction);
    assert.equal(movement.press('key:w', direction, 130), null);
    assert.equal(movement.tick(125), null);
    assert.equal(movement.tick(120 + INITIAL_MOVE_DELAY - 1), null);
    movement.release('key:w', 120 + INITIAL_MOVE_DELAY - 1);
    assert.equal(movement.tick(2000), null);
});

test('held movement waits initially, repeats at a steady cadence and never catches up in bursts', () => {
    const movement = createHeldMovement();
    const direction = [1, 0, 'right'];
    movement.press('key:d', direction, 0);
    assert.equal(movement.tick(INITIAL_MOVE_DELAY - 1), null);
    assert.deepEqual(movement.tick(INITIAL_MOVE_DELAY), direction);
    assert.equal(movement.tick(INITIAL_MOVE_DELAY + HELD_MOVE_INTERVAL - 1), null);
    assert.deepEqual(movement.tick(INITIAL_MOVE_DELAY + HELD_MOVE_INTERVAL), direction);
    assert.deepEqual(movement.tick(10_000), direction);
    assert.equal(movement.tick(10_001), null);
});

test('releasing one movement key preserves another held direction and resetting clears touch and keys', () => {
    const movement = createHeldMovement();
    const up = [0, -1, 'up'];
    const right = [1, 0, 'right'];
    movement.press('key:w', up, 0);
    movement.press('key:d', right, 20);
    movement.release('key:w', 30);
    assert.deepEqual(movement.tick(20 + INITIAL_MOVE_DELAY), right);
    movement.press('pointer:7', up, 400);
    movement.release('pointer:7', 450);
    assert.equal(movement.tick(450 + HELD_MOVE_INTERVAL - 1), null);
    assert.deepEqual(movement.tick(450 + HELD_MOVE_INTERVAL), right);
    movement.reset();
    assert.equal(movement.tick(20_000), null);
    assert.deepEqual(movement.press('key:d', right, 20_001), right);
});

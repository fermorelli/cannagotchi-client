export const COLS = 20;
export const ROWS = 13;
export const SPOTS = [{ x: 4, y: 6 }, { x: 8, y: 6 }, { x: 12, y: 6 }, { x: 16, y: 6 }, { x: 7, y: 10 }, { x: 13, y: 10 }];
export const EMPTY_POT = { x: 16, y: 10, id: 'empty-pot', empty: true, name: 'Plant something' };
export const DIRECTIONS = { ArrowUp: [0, -1, 'up'], w: [0, -1, 'up'], ArrowDown: [0, 1, 'down'], s: [0, 1, 'down'], ArrowLeft: [-1, 0, 'left'], a: [-1, 0, 'left'], ArrowRight: [1, 0, 'right'], d: [1, 0, 'right'] };
export const keyFor = (x, y) => `${x},${y}`;
export const distance = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
export const getGardenPageCount = (plantCount) => Math.max(1, Math.ceil(plantCount / SPOTS.length));

export function getGardenPageForPlant(plants, plantId) {
    if (plantId === null || plantId === undefined) return -1;
    const index = plants.findIndex((plant) => String(plant._id) === String(plantId));
    return index < 0 ? -1 : Math.floor(index / SPOTS.length);
}

export function getGardenPlantRange(plantCount, page = 0) {
    const safePage = Math.max(0, Math.min(page, getGardenPageCount(plantCount) - 1));
    return {
        first: plantCount === 0 ? 0 : safePage * SPOTS.length + 1,
        last: Math.min((safePage + 1) * SPOTS.length, plantCount),
        total: plantCount,
    };
}

export function getGardenObjects(plants, page = 0) {
    const safePage = Math.max(0, Math.min(page, getGardenPageCount(plants.length) - 1));
    return [...plants.slice(safePage * SPOTS.length, (safePage + 1) * SPOTS.length).map((plant, i) => ({ ...SPOTS[i], id: plant._id, plant, name: plant.plant_name || 'Unnamed plant' })), EMPTY_POT];
}

export function makeObstacles() {
    const set = new Set();
    for (let x = 0; x < COLS; x += 1) { set.add(keyFor(x, 0)); set.add(keyFor(x, ROWS - 1)); }
    for (let y = 0; y < ROWS; y += 1) { set.add(keyFor(0, y)); set.add(keyFor(COLS - 1, y)); }
    for (let x = 3; x <= 8; x += 1) for (let y = 1; y <= 3; y += 1) set.add(keyFor(x, y));
    for (let x = 1; x <= 4; x += 1) for (let y = 10; y <= 11; y += 1) set.add(keyFor(x, y));
    for (let x = 12; x <= 15; x += 1) set.add(keyFor(x, 3));
    [{ x: 1, y: 2 }, { x: 10, y: 2 }, { x: 17, y: 2 }, { x: 18, y: 3 }, { x: 18, y: 9 }, { x: 1, y: 8 }].forEach(({ x, y }) => set.add(keyFor(x, y)));
    // Unoccupied beds remain solid too, so changing patches never moves scenery.
    [...SPOTS, EMPTY_POT].forEach(({ x, y }) => set.add(keyFor(x, y)));
    return set;
}

export function pathToObject(start, object, obstacles) {
    const queue = [{ x: start.x, y: start.y, path: [] }];
    const visited = new Set([keyFor(start.x, start.y)]);
    while (queue.length) {
        const current = queue.shift();
        if (distance(current, object) === 1) return current.path;
        for (const [dx, dy, facing] of [DIRECTIONS.ArrowUp, DIRECTIONS.ArrowDown, DIRECTIONS.ArrowLeft, DIRECTIONS.ArrowRight]) {
            const x = current.x + dx;
            const y = current.y + dy;
            const key = keyFor(x, y);
            if (x < 0 || y < 0 || x >= COLS || y >= ROWS || visited.has(key) || obstacles.has(key)) continue;
            visited.add(key);
            queue.push({ x, y, path: [...current.path, { x, y, facing }] });
        }
    }
    return null;
}

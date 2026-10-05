// A tap always moves one tile. Holding a direction starts repeating after a
// deliberate pause, independent of the operating system's keyboard repeat.
export const INITIAL_MOVE_DELAY = 280;
export const HELD_MOVE_INTERVAL = 180;

export function createHeldMovement() {
    const pressed = new Map();
    let active = null;
    let nextMoveAt = 0;

    return {
        press(key, direction, now) {
            if (pressed.has(key)) return null;
            pressed.set(key, direction);
            active = key;
            nextMoveAt = now + INITIAL_MOVE_DELAY;
            return direction;
        },
        release(key, now) {
            if (!pressed.delete(key) || active !== key) return;
            active = [...pressed.keys()].at(-1) ?? null;
            nextMoveAt = now + HELD_MOVE_INTERVAL;
        },
        tick(now) {
            if (active === null || now < nextMoveAt) return null;
            // One step per tick: a delayed frame must never cause a catch-up burst.
            nextMoveAt = now + HELD_MOVE_INTERVAL;
            return pressed.get(active);
        },
        reset() {
            pressed.clear();
            active = null;
            nextMoveAt = 0;
        },
    };
}

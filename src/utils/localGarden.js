// This explicit demo collection stays separate from all account/API records.
export const LOCAL_GARDEN_ID = 'local-garden';
export const LOCAL_GARDEN_KEY = 'cannagotchi.local-garden.v1';
const ACTIVE_KEY = 'cannagotchi.local-garden.active.v1';

export const localGardenProfile = {
    _id: LOCAL_GARDEN_ID,
    firstName: 'Garden',
    lastName: 'Visitor',
    email: 'local@garden.example',
};

export const localGardenUser = { uid: LOCAL_GARDEN_ID, email: localGardenProfile.email };

const dateDaysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const createExamplePlants = () => [
    { _id: 'local-luna', user_id: LOCAL_GARDEN_ID, plant_name: 'Luna', genetic: 'Indica', grow_mode: 'Interior', auto: false, germination_date: dateDaysAgo(9) },
    { _id: 'local-sol', user_id: LOCAL_GARDEN_ID, plant_name: 'Sol', genetic: 'Sativa', grow_mode: 'Exterior', auto: false, germination_date: dateDaysAgo(42) },
    { _id: 'local-menta', user_id: LOCAL_GARDEN_ID, plant_name: 'Menta', genetic: 'Indica-dominating breed', grow_mode: 'Interior', auto: true, germination_date: dateDaysAgo(108) },
];

export const isLocalGardenActive = () => {
    try {
        return localStorage.getItem(ACTIVE_KEY) === 'true';
    } catch {
        return false;
    }
};

export const setLocalGardenActive = (active) => {
    try {
        if (active) localStorage.setItem(ACTIVE_KEY, 'true');
        else localStorage.removeItem(ACTIVE_KEY);
    } catch {
        throw new Error('Browser storage is unavailable. Allow storage to use the local garden.');
    }
};

export const saveLocalPlants = (plants) => {
    try {
        localStorage.setItem(LOCAL_GARDEN_KEY, JSON.stringify({ version: 1, plants }));
    } catch {
        throw new Error('The local garden could not be saved. Check browser storage space and try again.');
    }
};

export const readLocalPlants = () => {
    let saved;
    try {
        saved = localStorage.getItem(LOCAL_GARDEN_KEY);
    } catch {
        throw new Error('Browser storage is unavailable. Allow storage to use the local garden.');
    }

    if (saved === null) {
        const examples = createExamplePlants();
        saveLocalPlants(examples);
        return examples;
    }

    try {
        const data = JSON.parse(saved);
        const ids = new Set();
        if (data.version !== 1 || !Array.isArray(data.plants) || data.plants.some((plant) => {
            if (!plant || typeof plant._id !== 'string' || ids.has(plant._id) || plant.user_id !== LOCAL_GARDEN_ID) return true;
            ids.add(plant._id);
            return !['plant_name', 'genetic', 'grow_mode', 'germination_date'].every((key) => typeof plant[key] === 'string');
        })) throw new Error('Invalid garden');
        return data.plants;
    } catch {
        throw new Error('The saved local garden could not be read. Its records have been kept unchanged.');
    }
};

export const newLocalPlantId = () => `local-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;

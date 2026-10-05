export const CARE_TYPES = [
    { value: 'water', label: 'Watering' },
    { value: 'feed', label: 'Feeding' },
    { value: 'note', label: 'Observation' },
    { value: 'measurement', label: 'Measurement' },
];

export const CARE_STAGES = [
    { value: 'auto', label: 'Estimate from age' },
    { value: 'seed', label: 'Seed / planted pot' },
    { value: 'sprout', label: 'Sprout' },
    { value: 'seedling', label: 'Seedling' },
    { value: 'vegetative', label: 'Vegetative' },
    { value: 'flowering', label: 'Flowering' },
    { value: 'mature', label: 'Mature flowering' },
];

export const getCareStorageKey = (userId) => `cannagotchi:care:v1:${encodeURIComponent(userId)}`;
export const emptyCareJournal = () => ({ entries: {}, stages: {} });

const validTypes = new Set(CARE_TYPES.map(({ value }) => value));
const validStages = new Set(CARE_STAGES.map(({ value }) => value));
const entryTime = (entry) => new Date(entry.occurredAt).getTime();

export const createCareEntry = ({ type, note = '', height, date }, now = new Date()) => {
    if (!validTypes.has(type)) throw new Error('Choose a care entry type.');
    const cleanNote = String(note).trim();
    if (cleanNote.length > 1000) throw new Error('Keep notes under 1,000 characters.');
    if (type === 'note' && !cleanNote) throw new Error('Write an observation before saving.');

    const occurredAt = date ? new Date(date) : now;
    if (!Number.isFinite(occurredAt.getTime())) throw new Error('Choose a valid date and time.');
    if (occurredAt.getTime() > now.getTime() + 60000) throw new Error('Log care that has already happened.');

    let measurement;
    if (type === 'measurement') {
        measurement = Number(height);
        if (!Number.isFinite(measurement) || measurement <= 0 || measurement > 10000) {
            throw new Error('Enter a height between 0 and 10,000 cm.');
        }
    }

    return {
        id: globalThis.crypto?.randomUUID?.() || `care-${now.getTime()}-${Math.random().toString(36).slice(2)}`,
        type,
        note: cleanNote,
        ...(measurement !== undefined ? { height: measurement } : {}),
        occurredAt: occurredAt.toISOString(),
        createdAt: now.toISOString(),
    };
};

export const sanitizeCareJournal = (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return emptyCareJournal();
    const entries = Object.fromEntries(
        Object.entries(value.entries || {}).filter(([, list]) => Array.isArray(list)).map(([plantId, list]) => [
            plantId,
            list.filter((entry) => entry && typeof entry.id === 'string' && validTypes.has(entry.type)
                && Number.isFinite(entryTime(entry))
                && (entry.type !== 'measurement' || (Number.isFinite(entry.height) && entry.height > 0 && entry.height <= 10000)))
                .map((entry) => ({
                    id: entry.id,
                    type: entry.type,
                    note: typeof entry.note === 'string' ? entry.note.slice(0, 1000) : '',
                    ...(entry.type === 'measurement' ? { height: entry.height } : {}),
                    occurredAt: new Date(entry.occurredAt).toISOString(),
                    createdAt: Number.isFinite(new Date(entry.createdAt).getTime()) ? entry.createdAt : entry.occurredAt,
                })).sort((a, b) => entryTime(b) - entryTime(a)),
        ]),
    );
    const stages = Object.fromEntries(Object.entries(value.stages || {}).filter(([, stage]) => validStages.has(stage) && stage !== 'auto'));
    return { entries, stages };
};

// This describes logging activity only; it is not a plant-health or watering assessment.
export const getCareSummary = (entries = [], now = new Date()) => {
    const validEntries = entries.filter((entry) => Number.isFinite(entryTime(entry)) && entryTime(entry) <= now.getTime())
        .sort((a, b) => entryTime(b) - entryTime(a));
    const lastEntry = validEntries[0] || null;
    return {
        entryCount: validEntries.length,
        lastEntry,
        loggedRecently: !!lastEntry && now.getTime() - entryTime(lastEntry) <= 7 * 86400000,
        lastWatered: validEntries.find((entry) => entry.type === 'water') || null,
        lastMeasurement: validEntries.find((entry) => entry.type === 'measurement') || null,
    };
};

export const formatCareDate = (value) => new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium', timeStyle: 'short',
}).format(new Date(value));

export const localDateTimeValue = (date = new Date()) => {
    const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localTime.toISOString().slice(0, 16);
};

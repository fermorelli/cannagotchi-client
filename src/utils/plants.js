const HARVEST_DAYS_BY_GENETIC = {
    Indica: 180,
    Sativa: 220,
    'Sativa-dominating breed': 200,
    'Indica-dominating breed': 190,
};

// Germination is a calendar day. The API may serialize it as midnight UTC,
// which should keep the recorded day when viewed from another time zone.
const parsePlantDate = (value) => {
    if (!value) return null;
    const storedDay = typeof value === 'string' && value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T00:00(?::00(?:\.0+)?)?(?:Z|\+00:00))?$/i);
    if (storedDay) {
        const [, year, month, day] = storedDay.map(Number);
        const date = new Date(0);
        date.setFullYear(year, month - 1, day);
        date.setHours(0, 0, 0, 0);
        return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

// Compare local calendar dates on a UTC grid so a 23/25-hour DST day counts once.
const calendarDay = (date) => {
    const calendar = new Date(0);
    calendar.setUTCFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    calendar.setUTCHours(0, 0, 0, 0);
    return calendar.getTime() / 86400000;
};

export const formatPlantDate = (value, locale = 'en-GB') => {
    const date = parsePlantDate(value);
    return date ? date.toLocaleDateString(locale) : 'Not set';
};

export const getPlantAgeInDays = (value) => {
    const date = parsePlantDate(value);
    return date ? Math.max(0, calendarDay(new Date(Date.now())) - calendarDay(date)) : 0;
};

export const getPlantStageLabel = (ageInDays) => {
    if (ageInDays <= 30) {
        return 'Seedling';
    }

    if (ageInDays <= 60) {
        return 'Vegetative';
    }

    if (ageInDays <= 90) {
        return 'Early flower';
    }

    if (ageInDays <= 120) {
        return 'Flowering';
    }

    if (ageInDays <= 180) {
        return 'Late flower';
    }

    return 'Harvest window';
};

export const getEstimatedHarvestDate = (plant) => {
    const days = HARVEST_DAYS_BY_GENETIC[plant?.genetic];

    if (!days || !plant?.germination_date) {
        return null;
    }

    const germinationDate = parsePlantDate(plant.germination_date);
    if (!germinationDate) {
        return null;
    }

    germinationDate.setDate(germinationDate.getDate() + days);
    return germinationDate;
};

export const getDaysUntilHarvest = (plant) => {
    const date = getEstimatedHarvestDate(plant);

    if (!date) {
        return null;
    }

    return calendarDay(date) - calendarDay(new Date(Date.now()));
};

export const isAutoflower = (value) => {
    return value === true || value === 'true' || value === 'on' || value === 1 || value === '1';
};

const HARVEST_DAYS_BY_GENETIC = {
    Indica: 180,
    Sativa: 220,
    'Sativa-dominating breed': 200,
    'Indica-dominating breed': 190,
};

export const formatPlantDate = (value, locale = 'en-GB') => {
    if (!value) {
        return 'Not set';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Not set';
    }

    return date.toLocaleDateString(locale);
};

export const getPlantAgeInDays = (value) => {
    if (!value) {
        return 0;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 0;
    }

    return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));
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

    const germinationDate = new Date(plant.germination_date);

    if (Number.isNaN(germinationDate.getTime())) {
        return null;
    }

    return new Date(germinationDate.getTime() + days * 86400000);
};

export const getDaysUntilHarvest = (plant) => {
    const date = getEstimatedHarvestDate(plant);

    if (!date) {
        return null;
    }

    return Math.ceil((date.getTime() - Date.now()) / 86400000);
};

export const isAutoflower = (value) => {
    return value === true || value === 'true' || value === 'on' || value === 1 || value === '1';
};

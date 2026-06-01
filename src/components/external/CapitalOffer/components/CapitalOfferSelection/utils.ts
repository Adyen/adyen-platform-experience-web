export const getRelativeToDefault = (val: number, defaultVal: number | undefined): 'Increased' | 'Decreased' | 'Equal' | undefined =>
    defaultVal === undefined ? undefined : val > defaultVal ? 'Increased' : val < defaultVal ? 'Decreased' : 'Equal';

export const getValuePercentage = (val: number, min: number | undefined, max: number | undefined): number | undefined =>
    min !== undefined && max !== undefined ? Math.round(((val - min) / (max - min)) * 100) : undefined;

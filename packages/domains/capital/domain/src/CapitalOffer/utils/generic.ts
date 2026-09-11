const DAY_MS = 24 * 60 * 60 * 1000;
const DAYS_PER_MONTH = 30;

export type RenewalAmountBreakdown = {
    amountToReceive: number;
    currency: string;
    newGrantAmountValue: number;
    remainingGrantAmountValue: number;
};

export const calculateMonthsFromDays = (days: number): number => {
    return Math.ceil(days / DAYS_PER_MONTH);
};

export const calculateMonthsAndDaysFromDays = (days: number): { months: number; remainingDays: number } => {
    const months = Math.floor(days / DAYS_PER_MONTH);
    const remainingDays = days % DAYS_PER_MONTH;
    return { months, remainingDays };
};

export const calculateTimestampAfterDays = (days: number): number => {
    const startOfCurrentUTCDay = new Date().setUTCHours(0, 0, 0, 0);
    const daysInMs = Math.floor(days) * DAY_MS;
    return new Date(startOfCurrentUTCDay + daysInMs).getTime();
};

export const getRelativeToDefault = (value: number, defaultValue: number | undefined): 'Increased' | 'Decreased' | 'Equal' | undefined => {
    return defaultValue === undefined ? undefined : value > defaultValue ? 'Increased' : value < defaultValue ? 'Decreased' : 'Equal';
};

export const getPercentageOfRange = (val: number, min: number | undefined, max: number | undefined): number | undefined => {
    return min !== undefined && max !== undefined && max !== min ? Math.round(((val - min) / (max - min)) * 100) : undefined;
};

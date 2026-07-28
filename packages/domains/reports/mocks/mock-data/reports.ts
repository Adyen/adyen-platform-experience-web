import type { IReport } from '@integration-components/types';

const daysAgo = (days: number) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - days);
    d.setUTCHours(0, 0, 0, 0);
    return d.toISOString();
};

const linearSpread = (length: number, min: number, max: number) => {
    const range = max - min;
    const span = Math.max(length - 1, 1);
    return Array.from({ length }, (_, i) => Math.round(min + (range * i) / span));
};

const generateReports = (...buckets: number[][]): IReport[] => {
    return buckets.flat().map(days => ({ createdAt: daysAgo(days), type: 'payout' }) as const);
};

export const REPORTS: { [balanceAccountId: string]: IReport[] } = {
    // main balance account
    BA32272223222B5CTDQPM6W2H: generateReports(
        linearSpread(5, 0, 6), // last 7 days
        linearSpread(15, 8, 29), // last 30 days
        linearSpread(15, 31, 85), // last 90 days
        linearSpread(20, 95, 150) // last 180 days
    ),

    // secondary balance account
    BA32272223222B5CTDQPM6W2G: generateReports(
        linearSpread(3, 0, 6), // last 7 days
        linearSpread(9, 7, 30), // last 30 days
        linearSpread(12, 31, 90), // last 90 days
        linearSpread(16, 95, 150) // last 180 days
    ),
};

export const getReports = (balanceAccountId: string) => REPORTS?.[balanceAccountId] ?? [];

import type { IReport } from '@integration-components/types';

const daysAgo = (days: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return `${d.toISOString().slice(0, 10)}T00:00:00.000Z`;
};

const spread = (count: number, from: number, to: number): number[] =>
    Array.from({ length: count }, (_, i) => Math.round(from + (i / Math.max(count - 1, 1)) * (to - from)));

const generateReports = (...buckets: number[][]): IReport[] => buckets.flat().map(days => ({ createdAt: daysAgo(days), type: 'payout' as const }));

export const REPORTS: { [balanceAccountId: string]: IReport[] } = {
    BA32272223222B5CTDQPM6W2H: generateReports(
        spread(10, 0, 6), // last 7 days
        spread(15, 8, 29), // last 30 days
        spread(15, 31, 85), // last 90 days
        spread(10, 95, 150) // year to date
    ),
    BA32272223222B5CTDQPM6W2G: generateReports(
        spread(10, 0, 6), // last 7 days
        spread(15, 8, 29), // last 30 days
        spread(15, 31, 85), // last 90 days
        spread(10, 95, 150) // year to date
    ),
};
export const getReports = (balanceAccountId: string) => REPORTS?.[balanceAccountId] ?? [];

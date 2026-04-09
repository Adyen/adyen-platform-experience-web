import type { IReport } from '../../src/types';

// Generate report dates dynamically so they always fall within the component's default filter range
function generateReportDates(count: number): IReport[] {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    return Array.from({ length: count }, (_, i) => ({
        createdAt: new Date(now - (i + 1) * dayMs + Math.random() * dayMs * 0.8).toISOString(),
        type: 'payout' as const,
    }));
}

export const REPORTS: { [balanceAccountId: string]: IReport[] } = {
    BA32272223222B5CTDQPM6W2H: generateReportDates(50),
    BA32272223222B5CTDQPM6W2G: generateReportDates(50),
};

export const getReports = (balanceAccountId: string) => REPORTS?.[balanceAccountId] ?? [];

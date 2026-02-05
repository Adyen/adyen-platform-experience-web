export interface FinancialDataPoint {
    month: string;
    realized: number | null;
    projected: number | null;
    blocked: number;
    refused: number;
    fraudRate: number;
}

export const financialData: FinancialDataPoint[] = [
    {
        month: 'Jan',
        realized: 120000,
        projected: null,
        blocked: 3200,
        refused: 1800,
        fraudRate: 0.7,
    },
    {
        month: 'Feb',
        realized: 132000,
        projected: null,
        blocked: 3400,
        refused: 1900,
        fraudRate: 0.8,
    },
    {
        month: 'Mar',
        realized: 128000,
        projected: null,
        blocked: 3100,
        refused: 1700,
        fraudRate: 0.6,
    },
    {
        month: 'Apr',
        realized: 145000,
        projected: null,
        blocked: 3600,
        refused: 2100,
        fraudRate: 0.9,
    },
    {
        month: 'May',
        realized: 158000,
        projected: null,
        blocked: 3800,
        refused: 2300,
        fraudRate: 1.1,
    },
    {
        month: 'Jun',
        realized: 149000,
        projected: null,
        blocked: 3300,
        refused: 2000,
        fraudRate: 0.8,
    },
    {
        month: 'Jul',
        realized: 165000,
        projected: null,
        blocked: 3900,
        refused: 2200,
        fraudRate: 1,
    },
    {
        month: 'Aug',
        realized: 172000,
        projected: null,
        blocked: 4100,
        refused: 2400,
        fraudRate: 1.2,
    },
    {
        month: 'Sep',
        realized: 160000,
        projected: null,
        blocked: 3700,
        refused: 2150,
        fraudRate: 0.9,
    },
    {
        month: 'Oct',
        realized: null,
        projected: 175000,
        blocked: 4200,
        refused: 2500,
        fraudRate: 1.3,
    },
    {
        month: 'Nov',
        realized: null,
        projected: 182000,
        blocked: 4400,
        refused: 2600,
        fraudRate: 1.4,
    },
    {
        month: 'Dec',
        realized: null,
        projected: 190000,
        blocked: 4600,
        refused: 2700,
        fraudRate: 1.5,
    },
];

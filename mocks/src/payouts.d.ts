type Payout = {
    id: string;
    grossPayout: {
        value: number;
        currency: string;
    };
    adjustments: {
        value: number;
        currency: string;
    };
    netPayout: {
        value: number;
        currency: string;
    };
    creationDate: string;
    downloadUrl: string;
};
export declare const BASIC_PAYOUTS_LIST: Payout[];
export {};
//# sourceMappingURL=payouts.d.ts.map

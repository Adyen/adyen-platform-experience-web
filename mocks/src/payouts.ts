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

const PAYOUT_DETAILS_1: Payout = {
    id: '1WEPGD5VS767881Q',
    grossPayout: {
        value: 1000000,
        currency: 'USD',
    },
    adjustments: {
        value: 10000,
        currency: 'USD',
    },
    netPayout: {
        value: 990000,
        currency: 'USD',
    },
    creationDate: '2024-03-13T10:00:00Z',
    downloadUrl: 'https://.../download?balanceAccountId={balanceAccountId}&createdAt={createdAt}',
};
const PAYOUT_DETAILS_2: Payout = {
    id: '1WEPGD5VS767881E',
    grossPayout: {
        value: 100,
        currency: 'USD',
    },
    adjustments: {
        value: 5,
        currency: 'USD',
    },
    netPayout: {
        value: 95,
        currency: 'USD',
    },
    creationDate: '2024-03-13T10:00:00Z',
    downloadUrl: 'https://.../download?balanceAccountId={balanceAccountId}&createdAt={createdAt}',
};
const PAYOUT_DETAILS_3: Payout = {
    id: '1WEPGD5VS767882E',
    grossPayout: {
        value: 100,
        currency: 'USD',
    },
    adjustments: {
        value: 5,
        currency: 'USD',
    },
    netPayout: {
        value: 95,
        currency: 'USD',
    },
    creationDate: '2024-03-13T10:00:00Z',
    downloadUrl: 'https://.../download?balanceAccountId={balanceAccountId}&createdAt={createdAt}',
};
const PAYOUT_DETAILS_4: Payout = {
    id: '1WEPGD5VS767883E',
    grossPayout: {
        value: 100,
        currency: 'USD',
    },
    adjustments: {
        value: 5,
        currency: 'USD',
    },
    netPayout: {
        value: 95,
        currency: 'USD',
    },
    creationDate: '2024-03-13T10:00:00Z',
    downloadUrl: 'https://.../download?balanceAccountId={balanceAccountId}&createdAt={createdAt}',
};
const PAYOUT_DETAILS_5: Payout = {
    id: '1WEPGD5VS767885E',
    grossPayout: {
        value: 100,
        currency: 'USD',
    },
    adjustments: {
        value: 5,
        currency: 'USD',
    },
    netPayout: {
        value: 95,
        currency: 'USD',
    },
    creationDate: '2024-03-13T10:00:00Z',
    downloadUrl: 'https://.../download?balanceAccountId={balanceAccountId}&createdAt={createdAt}',
};
const PAYOUT_DETAILS_6: Payout = {
    id: '1WEPGD5VS767886E',
    grossPayout: {
        value: 100,
        currency: 'USD',
    },
    adjustments: {
        value: 5,
        currency: 'USD',
    },
    netPayout: {
        value: 95,
        currency: 'USD',
    },
    creationDate: '2024-03-13T10:00:00Z',
    downloadUrl: 'https://.../download?balanceAccountId={balanceAccountId}&createdAt={createdAt}',
};
const PAYOUT_DETAILS_7: Payout = {
    id: '1WEPGD5VS767887E',
    grossPayout: {
        value: 100,
        currency: 'USD',
    },
    adjustments: {
        value: 5,
        currency: 'USD',
    },
    netPayout: {
        value: 95,
        currency: 'USD',
    },
    creationDate: '2024-03-13T10:00:00Z',
    downloadUrl: 'https://.../download?balanceAccountId={balanceAccountId}&createdAt={createdAt}',
};
const PAYOUT_DETAILS_8: Payout = {
    id: '1WEPGD5VS767888E',
    grossPayout: {
        value: 100,
        currency: 'USD',
    },
    adjustments: {
        value: 5,
        currency: 'USD',
    },
    netPayout: {
        value: 95,
        currency: 'USD',
    },
    creationDate: '2024-03-13T10:00:00Z',
    downloadUrl: 'https://.../download?balanceAccountId={balanceAccountId}&createdAt={createdAt}',
};
const PAYOUT_DETAILS_9: Payout = {
    id: '1WEPGD5VS767889E',
    grossPayout: {
        value: 100,
        currency: 'USD',
    },
    adjustments: {
        value: 5,
        currency: 'USD',
    },
    netPayout: {
        value: 95,
        currency: 'USD',
    },
    creationDate: '2024-03-13T10:00:00Z',
    downloadUrl: 'https://.../download?balanceAccountId={balanceAccountId}&createdAt={createdAt}',
};
const PAYOUT_DETAILS_10: Payout = {
    id: '1WEPGD5VS767889Q',
    grossPayout: {
        value: 100,
        currency: 'USD',
    },
    adjustments: {
        value: 5,
        currency: 'USD',
    },
    netPayout: {
        value: 95,
        currency: 'USD',
    },
    creationDate: '2024-03-13T10:00:00Z',
    downloadUrl: 'https://.../download?balanceAccountId={balanceAccountId}&createdAt={createdAt}',
};
const PAYOUT_DETAILS_11: Payout = {
    id: '1WEPGD5VS767899Q',
    grossPayout: {
        value: 100,
        currency: 'USD',
    },
    adjustments: {
        value: 5,
        currency: 'USD',
    },
    netPayout: {
        value: 95,
        currency: 'USD',
    },
    creationDate: '2024-03-13T10:00:00Z',
    downloadUrl: 'https://.../download?balanceAccountId={balanceAccountId}&createdAt={createdAt}',
};

export const BASIC_PAYOUTS_LIST = [
    PAYOUT_DETAILS_1,
    PAYOUT_DETAILS_2,
    PAYOUT_DETAILS_3,
    PAYOUT_DETAILS_4,
    PAYOUT_DETAILS_5,
    PAYOUT_DETAILS_6,
    PAYOUT_DETAILS_7,
    PAYOUT_DETAILS_8,
    PAYOUT_DETAILS_9,
    PAYOUT_DETAILS_10,
    PAYOUT_DETAILS_11,
];

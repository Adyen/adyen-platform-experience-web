export const CASHOUT_CONFIGURATION = {
    balanceAmount: {
        value: 500000,
        currency: 'USD',
    },
    availableForCashoutAmount: {
        value: 3000,
        currency: 'USD',
    },
    pendingAmount: {
        value: 100000,
        currency: 'USD',
    },
    isCashoutAvailable: true,
    unsupportedReasons: [] as string[],
    minAmount: 1000,
    maxAmount: 400000,
    accountKey: 'AccountHolder.AH123321123123',
};

const createUnavailableConfig = (reason: string, overrides?: Partial<typeof CASHOUT_CONFIGURATION>) => ({
    ...CASHOUT_CONFIGURATION,
    isCashoutAvailable: false,
    unsupportedReasons: [reason],
    ...overrides,
});

export const CASHOUT_CONFIGURATION_UNAVAILABLE_ZERO_BALANCE = createUnavailableConfig('zero_balance', {
    balanceAmount: { value: 0, currency: 'USD' },
    availableForCashoutAmount: { value: 0, currency: 'USD' },
});

export const CASHOUT_CONFIGURATION_UNAVAILABLE_UNSUPPORTED_CURRENCY = createUnavailableConfig('unsupported_currency');
export const CASHOUT_CONFIGURATION_UNAVAILABLE_UNSUPPORTED_REGION = createUnavailableConfig('unsupported_region');
export const CASHOUT_CONFIGURATION_UNAVAILABLE_NO_TRANSFER_INSTRUMENTS = createUnavailableConfig('no_transfer_instruments');
export const CASHOUT_CONFIGURATION_UNAVAILABLE_COOLDOWN = createUnavailableConfig('cashout_cooldown');
export const CASHOUT_CONFIGURATION_UNAVAILABLE_DAILY_LIMIT = createUnavailableConfig('daily_limit_reached');
export const CASHOUT_CONFIGURATION_UNAVAILABLE_CAPABILITY = createUnavailableConfig('capability_configuration');
export const CASHOUT_CONFIGURATION_UNAVAILABLE_RISK = createUnavailableConfig('risk_rejection');

export const CASHOUT_BALANCE_ACCOUNTS = {
    data: [
        {
            balanceAccountId: 'BA00000000000000000000001',
            balanceAccountDescription: 'Main balance account',
        },
        {
            balanceAccountId: 'BA00000000000000000000002',
            balanceAccountDescription: 'Secondary balance account',
        },
    ],
};

export const CASHOUT_FEES = {
    totalAmount: {
        value: 100000,
        currency: 'USD',
    },
    feesAmount: {
        value: 2000,
        currency: 'USD',
    },
    amountToReceive: {
        value: 98000,
        currency: 'USD',
    },
};

export const CASHOUT_TRANSFER_INSTRUMENTS = {
    data: [
        {
            transferInstrumentId: 'SE00000000000000000000001',
            type: 'visa',
            description: '**** **** **** 1234',
        },
        {
            transferInstrumentId: 'SE00000000000000000000002',
            type: 'bank',
            description: 'NL91 ABNA **** **** 01',
        },
    ],
};

export const CASHOUT_SUBMIT_SUCCESS = {
    status: 'OK',
};

export const CASHOUT_HISTORY = [
    {
        balanceAccountCode: 'BA00000000000000000000001',
        amount: {
            value: 500000,
            currency: 'USD',
        },
        feeAmount: {
            value: 2000,
            currency: 'USD',
        },
        transferInstrument: {
            transferInstrumentId: 'SE00000000000000000000002',
            type: 'bank',
            description: 'NL91 ABNA **** **** 01',
        },
        reference: 'SWP13443121234',
        descriptionReference: 'Manual Cashout by user.',
        creationDate: '2023-01-20T10:00:00.121Z',
    },
    {
        balanceAccountCode: 'BA00000000000000000000001',
        amount: {
            value: 250000,
            currency: 'USD',
        },
        feeAmount: {
            value: 1000,
            currency: 'USD',
        },
        transferInstrument: {
            transferInstrumentId: 'SE00000000000000000000001',
            type: 'visa',
            description: '**** **** **** 1234',
        },
        reference: 'SWP98765432101',
        descriptionReference: 'Manual Cashout by user.',
        creationDate: '2023-01-15T14:30:00.000Z',
    },
];

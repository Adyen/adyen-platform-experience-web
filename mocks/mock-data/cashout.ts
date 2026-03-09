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

export const CASHOUT_CONFIGURATION_UNAVAILABLE_ZERO_BALANCE = {
    ...CASHOUT_CONFIGURATION,
    balanceAmount: {
        value: 0,
        currency: 'USD',
    },
    availableForCashoutAmount: {
        value: 0,
        currency: 'USD',
    },
    isCashoutAvailable: false,
    unsupportedReasons: ['zero_balance'],
};

export const CASHOUT_CONFIGURATION_UNAVAILABLE_UNSUPPORTED_CURRENCY = {
    ...CASHOUT_CONFIGURATION,
    isCashoutAvailable: false,
    unsupportedReasons: ['unsupported_currency'],
};

export const CASHOUT_CONFIGURATION_UNAVAILABLE_UNSUPPORTED_REGION = {
    ...CASHOUT_CONFIGURATION,
    isCashoutAvailable: false,
    unsupportedReasons: ['unsupported_region'],
};

export const CASHOUT_CONFIGURATION_UNAVAILABLE_NO_TRANSFER_INSTRUMENTS = {
    ...CASHOUT_CONFIGURATION,
    isCashoutAvailable: false,
    unsupportedReasons: ['no_transfer_instruments'],
};

export const CASHOUT_CONFIGURATION_UNAVAILABLE_COOLDOWN = {
    ...CASHOUT_CONFIGURATION,
    isCashoutAvailable: false,
    unsupportedReasons: ['cashout_cooldown'],
};

export const CASHOUT_CONFIGURATION_UNAVAILABLE_DAILY_LIMIT = {
    ...CASHOUT_CONFIGURATION,
    isCashoutAvailable: false,
    unsupportedReasons: ['daily_limit_reached'],
};

export const CASHOUT_CONFIGURATION_UNAVAILABLE_CAPABILITY = {
    ...CASHOUT_CONFIGURATION,
    isCashoutAvailable: false,
    unsupportedReasons: ['capability_configuration'],
};

export const CASHOUT_CONFIGURATION_UNAVAILABLE_RISK = {
    ...CASHOUT_CONFIGURATION,
    isCashoutAvailable: false,
    unsupportedReasons: ['risk_rejection'],
};

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
        descriptionReference: 'Manual Cashout by user.', // TODO: Check if this stays in the final contract
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
        descriptionReference: 'Manual Cashout by user.', // TODO: Check if this stays in the final contract
        creationDate: '2023-01-15T14:30:00.000Z',
    },
];

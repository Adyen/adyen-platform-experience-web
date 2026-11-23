import type {
    IBalanceAccountBase,
    ICashOutAmount,
    ICashOutEligibility,
    ICashOutState,
    ICashOutTransferInstrument,
    ICashOutTransferInstrumentIneligibilityReason,
    ICashOutUnavailableReason,
} from '@integration-components/types';
import { BALANCE_ACCOUNTS } from '@integration-components/testing/fixtures';

const CURRENCY = 'EUR';

const getAmount = (value: number, currency = CURRENCY): ICashOutAmount => ({ currency, value });

// The daily limit and the fee structure are in the currency of the balance account. The fee matches the one the mock server
// calculates (0.50 + 1.5%).
const getLimitAndFee = (currency = CURRENCY): Pick<ICashOutEligibility, 'dailyLimit' | 'feeStructure'> => ({
    dailyLimit: getAmount(2_500_000, currency),
    feeStructure: { fixedAmount: getAmount(50, currency), variableBasisPoints: 150 },
});

const ELIGIBLE_TRANSFER_INSTRUMENTS = {
    netherlandsIban: {
        description: 'NL**ABNA******4300',
        eligible: true,
        ineligibilityReasons: [],
        transferInstrumentId: 'SE322KH223222F5GXZFNM3BGP',
    },
    unitedKingdomIban: {
        description: 'GB**NWBK**********1234',
        eligible: true,
        ineligibilityReasons: [],
        transferInstrumentId: 'SE322KT223222F5GXZFNM4C6K',
    },
    usAccountNumber: {
        description: '********5678',
        eligible: true,
        ineligibilityReasons: [],
        transferInstrumentId: 'SE322LJ223222F5GXZFNM5D7M',
    },
} satisfies Record<string, ICashOutTransferInstrument>;

const INELIGIBLE_TRANSFER_INSTRUMENTS = {
    noInstantTransferRoute: {
        description: 'GB**BARC**********5432',
        eligible: false,
        ineligibilityReasons: ['noInstantTransferRoute'],
        transferInstrumentId: 'SE322NL223222F5GXZFNM7F9P',
    },
    transferInstrumentCurrencyMismatch: {
        description: '********9012',
        eligible: false,
        ineligibilityReasons: ['transferInstrumentCurrencyMismatch'],
        transferInstrumentId: 'SE322PM223222F5GXZFNM8G2Q',
    },
} satisfies Record<ICashOutTransferInstrumentIneligibilityReason, ICashOutTransferInstrument>;

const baseEligibility: ICashOutEligibility = {
    availableForCashOutBalance: getAmount(100000),
    ...getLimitAndFee(),
    isCashoutAvailable: true,
    transferInstruments: Object.values(ELIGIBLE_TRANSFER_INSTRUMENTS),
    unavailableReasons: [],
};

export const ELIGIBILITY_AVAILABLE = {
    default: baseEligibility,
    singleTransferInstrument: {
        ...baseEligibility,
        transferInstruments: [ELIGIBLE_TRANSFER_INSTRUMENTS.unitedKingdomIban],
    },
    singleEligibleTransferInstrument: {
        ...baseEligibility,
        transferInstruments: [
            ELIGIBLE_TRANSFER_INSTRUMENTS.netherlandsIban,
            INELIGIBLE_TRANSFER_INSTRUMENTS.noInstantTransferRoute,
            INELIGIBLE_TRANSFER_INSTRUMENTS.transferInstrumentCurrencyMismatch,
        ],
    },
    withIneligibleTransferInstruments: {
        ...baseEligibility,
        transferInstruments: [...Object.values(ELIGIBLE_TRANSFER_INSTRUMENTS), ...Object.values(INELIGIBLE_TRANSFER_INSTRUMENTS)],
    },
    // Enough bank accounts, the ones that can't receive the cashOut included, for their dropdown to be searched.
    manyTransferInstruments: {
        ...baseEligibility,
        transferInstruments: [
            ...Object.values(ELIGIBLE_TRANSFER_INSTRUMENTS),
            ...[
                ['NL**RABO******1101', 'SE322QA223222F5GXZFNM9H3R'],
                ['NL**INGB******2202', 'SE322QB223222F5GXZFNM9H3S'],
                ['DE**DEUT**********3303', 'SE322QC223222F5GXZFNM9H3T'],
                ['DE**COBA**********4404', 'SE322QD223222F5GXZFNM9H3U'],
                ['FR**BNPA**********5505', 'SE322QE223222F5GXZFNM9H3V'],
                ['ES**CAIX**********6606', 'SE322QF223222F5GXZFNM9H3W'],
                ['IT**UNCR**********7707', 'SE322QG223222F5GXZFNM9H3X'],
            ].map(([description, transferInstrumentId]) => ({
                description: description!,
                eligible: true,
                ineligibilityReasons: [],
                transferInstrumentId: transferInstrumentId!,
            })),
            ...Object.values(INELIGIBLE_TRANSFER_INSTRUMENTS),
        ],
    },
} satisfies Record<string, ICashOutEligibility>;

// Enough balance accounts for their dropdown to be searched: those of the fixtures, and more of the same account holder.
export const MANY_BALANCE_ACCOUNTS: IBalanceAccountBase[] = [
    ...BALANCE_ACCOUNTS,
    ...['Payroll', 'Taxes', 'Savings', 'Marketing', 'Operations', 'Travel', 'Equipment', 'Rent', 'Reserve'].map((name, index) => ({
        description: `S. Hopper - ${name}`,
        id: `BA32272223222B5CTDQPM7W${index}A`,
        timeZone: 'America/Sao_Paulo',
        defaultCurrencyCode: 'EUR',
    })),
];

export const ELIGIBILITY_BY_BALANCE_ACCOUNT: Record<string, ICashOutEligibility> = {
    [BALANCE_ACCOUNTS[0].id]: {
        ...baseEligibility,
        ...getLimitAndFee('USD'),
        availableForCashOutBalance: getAmount(22000, 'USD'),
    },
    [BALANCE_ACCOUNTS[1].id]: baseEligibility,
    [BALANCE_ACCOUNTS[2].id]: {
        ...baseEligibility,
        ...getLimitAndFee('USD'),
        availableForCashOutBalance: getAmount(5250, 'USD'),
    },
};

const getUnavailableEligibility = (
    reason: ICashOutUnavailableReason,
    balances?: Partial<Pick<ICashOutEligibility, 'availableForCashOutBalance'>>
): ICashOutEligibility => ({
    ...baseEligibility,
    ...balances,
    isCashoutAvailable: false,
    transferInstruments: [],
    unavailableReasons: [reason],
});

export const ELIGIBILITY_UNAVAILABLE = {
    zeroBalance: getUnavailableEligibility('zeroBalance', { availableForCashOutBalance: getAmount(0) }),
    noInstantReachableTransferInstruments: getUnavailableEligibility('noInstantReachableTransferInstruments'),
    cashOutInProgress: getUnavailableEligibility('cashOutInProgress'),
    dailyLimitReached: getUnavailableEligibility('dailyLimitReached', { availableForCashOutBalance: getAmount(0) }),
    sendToBalanceAccountNotAllowed: getUnavailableEligibility('sendToBalanceAccountNotAllowed'),
    receiveFromBalanceAccountNotAllowed: getUnavailableEligibility('receiveFromBalanceAccountNotAllowed'),
    sendToTransferInstrumentNotAllowed: getUnavailableEligibility('sendToTransferInstrumentNotAllowed'),
    riskRestricted: getUnavailableEligibility('riskRestricted'),
    cashOutNotConfigured: getUnavailableEligibility('cashOutNotConfigured'),
} satisfies Record<ICashOutUnavailableReason, ICashOutEligibility>;

// Unavailable, with a single bank account that can receive the cashOut, next to ones that can't.
export const ELIGIBILITY_UNAVAILABLE_WITH_SINGLE_ELIGIBLE_TRANSFER_INSTRUMENT: ICashOutEligibility = {
    ...ELIGIBILITY_UNAVAILABLE.zeroBalance,
    transferInstruments: [
        INELIGIBLE_TRANSFER_INSTRUMENTS.noInstantTransferRoute,
        ELIGIBLE_TRANSFER_INSTRUMENTS.unitedKingdomIban,
        INELIGIBLE_TRANSFER_INSTRUMENTS.transferInstrumentCurrencyMismatch,
    ],
};

export const STATE_WITHOUT_RESTRICTIONS: ICashOutState = { unavailableReasons: [] };

// Every reason the state tells, the most blocking first, as the API tells them: those of the platform and of the account holder itself.
export const STATE_RESTRICTED: ICashOutState = {
    unavailableReasons: [
        'cashOutNotConfigured',
        'riskRestricted',
        'sendToBalanceAccountNotAllowed',
        'receiveFromBalanceAccountNotAllowed',
        'sendToTransferInstrumentNotAllowed',
    ],
};

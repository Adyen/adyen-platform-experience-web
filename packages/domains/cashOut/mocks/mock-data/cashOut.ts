import type {
    ICashOutAmount,
    ICashOutEligibility,
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
} satisfies Record<string, ICashOutEligibility>;

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

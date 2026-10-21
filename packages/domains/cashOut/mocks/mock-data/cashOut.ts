import type {
    ICashOutAmount,
    ICashOutEligibility,
    ICashOutTransferInstrument,
    ICashOutTransferInstrumentIneligibilityReason,
    ICashOutTransferInstrumentType,
    ICashOutUnavailableReason,
} from '@integration-components/types';
import { BALANCE_ACCOUNTS } from '@integration-components/testing/fixtures';

const CURRENCY = 'EUR';

const getAmount = (value: number): ICashOutAmount => ({ currency: CURRENCY, value });

const ELIGIBLE_TRANSFER_INSTRUMENTS = {
    bank: {
        description: 'NL91 **** **** 4300',
        eligible: true,
        ineligibilityReasons: [],
        transferInstrumentId: 'SE322KH223222F5GXZFNM3BGP',
        type: 'bank',
    },
    visa: {
        description: '•••• 1234',
        eligible: true,
        ineligibilityReasons: [],
        transferInstrumentId: 'SE322KT223222F5GXZFNM4C6K',
        type: 'visa',
    },
    mc: {
        description: '•••• 5678',
        eligible: true,
        ineligibilityReasons: [],
        transferInstrumentId: 'SE322LJ223222F5GXZFNM5D7M',
        type: 'mc',
    },
} satisfies Record<ICashOutTransferInstrumentType, ICashOutTransferInstrument>;

const INELIGIBLE_TRANSFER_INSTRUMENTS = {
    sendToTransferInstrumentNotAllowed: {
        description: 'DE89 **** **** 3000',
        eligible: false,
        ineligibilityReasons: ['sendToTransferInstrumentNotAllowed'],
        transferInstrumentId: 'SE322MK223222F5GXZFNM6E8N',
        type: 'bank',
    },
    noInstantTransferRoute: {
        description: 'GB33 **** **** 5432',
        eligible: false,
        ineligibilityReasons: ['noInstantTransferRoute'],
        transferInstrumentId: 'SE322NL223222F5GXZFNM7F9P',
        type: 'bank',
    },
    transferInstrumentCurrencyMismatch: {
        description: '•••• 9012',
        eligible: false,
        ineligibilityReasons: ['transferInstrumentCurrencyMismatch'],
        transferInstrumentId: 'SE322PM223222F5GXZFNM8G2Q',
        type: 'visa',
    },
} satisfies Record<ICashOutTransferInstrumentIneligibilityReason, ICashOutTransferInstrument>;

const baseEligibility: ICashOutEligibility = {
    availableBalance: getAmount(125000),
    availableForCashOutBalance: getAmount(100000),
    isCashoutAvailable: true,
    transferInstruments: Object.values(ELIGIBLE_TRANSFER_INSTRUMENTS),
    unavailableReasons: [],
};

export const ELIGIBILITY_AVAILABLE = {
    default: baseEligibility,
    singleTransferInstrument: {
        ...baseEligibility,
        transferInstruments: [ELIGIBLE_TRANSFER_INSTRUMENTS.visa],
    },
    withIneligibleTransferInstruments: {
        ...baseEligibility,
        transferInstruments: [...Object.values(ELIGIBLE_TRANSFER_INSTRUMENTS), ...Object.values(INELIGIBLE_TRANSFER_INSTRUMENTS)],
    },
} satisfies Record<string, ICashOutEligibility>;

export const ELIGIBILITY_BY_BALANCE_ACCOUNT: Record<string, ICashOutEligibility> = {
    [BALANCE_ACCOUNTS[0].id]: {
        ...baseEligibility,
        availableBalance: { currency: 'USD', value: 332500 },
        availableForCashOutBalance: { currency: 'USD', value: 22000 },
    },
    [BALANCE_ACCOUNTS[1].id]: baseEligibility,
    [BALANCE_ACCOUNTS[2].id]: {
        ...baseEligibility,
        availableBalance: { currency: 'USD', value: 5250 },
        availableForCashOutBalance: { currency: 'USD', value: 5250 },
    },
};

const getUnavailableEligibility = (
    reason: ICashOutUnavailableReason,
    balances?: Partial<Pick<ICashOutEligibility, 'availableBalance' | 'availableForCashOutBalance'>>
): ICashOutEligibility => ({
    ...baseEligibility,
    ...balances,
    isCashoutAvailable: false,
    transferInstruments: [],
    unavailableReasons: [reason],
});

export const ELIGIBILITY_UNAVAILABLE = {
    zeroBalance: getUnavailableEligibility('zeroBalance', { availableBalance: getAmount(0), availableForCashOutBalance: getAmount(0) }),
    noInstantReachableTransferInstruments: getUnavailableEligibility('noInstantReachableTransferInstruments'),
    cashOutInProgress: getUnavailableEligibility('cashOutInProgress'),
    dailyLimitReached: getUnavailableEligibility('dailyLimitReached', { availableForCashOutBalance: getAmount(0) }),
    sendToBalanceAccountNotAllowed: getUnavailableEligibility('sendToBalanceAccountNotAllowed'),
    receiveFromBalanceAccountNotAllowed: getUnavailableEligibility('receiveFromBalanceAccountNotAllowed'),
    riskRestricted: getUnavailableEligibility('riskRestricted'),
    cashOutNotConfigured: getUnavailableEligibility('cashOutNotConfigured'),
} satisfies Record<ICashOutUnavailableReason, ICashOutEligibility>;

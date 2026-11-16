import { ICapitalState, IDynamicOffersConfig } from '@integration-components/types';
import {
    ACTIVE_CASH_ADVANCE,
    ACTIVE_LOAN,
    PENDING_CASH_ADVANCE,
    PENDING_LOAN,
    RENEWABLE_CASH_ADVANCE,
    RENEWABLE_LOAN,
    RENEWING_ACTIVE_LOAN,
    RENEWING_ACTIVE_CASH_ADVANCE,
    SINGLE_ACTION_LOAN,
    SINGLE_ACTION_CASH_ADVANCE,
    ACTIONS_LOAN,
    ACTIONS_CASH_ADVANCE,
} from './grants';

export const REPAYMENT_TERM_QUARTER = 90;
export const REPAYMENT_TERM_HALF = 180;
export const REPAYMENT_TERM_FULL = 360;
export const REPAYMENT_TERMS = [REPAYMENT_TERM_QUARTER, REPAYMENT_TERM_HALF, REPAYMENT_TERM_FULL];

export const DYNAMIC_OFFER_CONFIG_LOAN = {
    contractType: 'Loan',
    estimatedRepaymentTermsInDays: REPAYMENT_TERMS,
    maxAmount: {
        value: 2500000,
        currency: 'EUR',
    },
    minAmount: {
        value: 100000,
        currency: 'EUR',
    },
    step: 10000,
} satisfies IDynamicOffersConfig;

export const DYNAMIC_OFFER_CONFIG_CASH_ADVANCE: IDynamicOffersConfig = {
    ...DYNAMIC_OFFER_CONFIG_LOAN,
    contractType: 'CashAdvance',
    maxAmount: {
        ...DYNAMIC_OFFER_CONFIG_LOAN.maxAmount,
        currency: 'GBP',
    },
    minAmount: {
        ...DYNAMIC_OFFER_CONFIG_LOAN.minAmount,
        currency: 'GBP',
    },
};

const CAPITAL_STATE_DEFAULT_LOAN: ICapitalState = {
    activeOrPendingGrants: [],
    dynamicOffer: undefined,
    hasClosedGrants: false,
    legalEntity: { region: 'EU' },
};

const CAPITAL_STATE_DEFAULT_CASH_ADVANCE: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT_LOAN,
    legalEntity: { region: 'GB' },
};

export const CAPITAL_STATE_UNSUPPORTED_REGION: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT_LOAN,
    legalEntity: { region: 'TR' },
};

export const CAPITAL_STATE_INELIGIBLE: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT_LOAN,
    dynamicOffer: undefined,
};

export const CAPITAL_STATE_ELIGIBLE_AND_ONGOING_LOAN: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT_LOAN,
    activeOrPendingGrants: [ACTIVE_LOAN],
    dynamicOffer: DYNAMIC_OFFER_CONFIG_LOAN,
};

export const CAPITAL_STATE_ELIGIBLE_AND_ONGOING_CASH_ADVANCE: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT_CASH_ADVANCE,
    activeOrPendingGrants: [ACTIVE_CASH_ADVANCE],
    dynamicOffer: DYNAMIC_OFFER_CONFIG_CASH_ADVANCE,
};

export const CAPITAL_STATE_FIRST_TIME_ELIGIBLE_LOAN: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT_LOAN,
    dynamicOffer: DYNAMIC_OFFER_CONFIG_LOAN,
    hasClosedGrants: false,
};

export const CAPITAL_STATE_FIRST_TIME_ELIGIBLE_CASH_ADVANCE: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT_CASH_ADVANCE,
    dynamicOffer: DYNAMIC_OFFER_CONFIG_CASH_ADVANCE,
    hasClosedGrants: false,
};

export const CAPITAL_STATE_ELIGIBLE_LOAN: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT_LOAN,
    dynamicOffer: DYNAMIC_OFFER_CONFIG_LOAN,
    hasClosedGrants: true,
};

export const CAPITAL_STATE_ELIGIBLE_CASH_ADVANCE: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT_CASH_ADVANCE,
    dynamicOffer: DYNAMIC_OFFER_CONFIG_CASH_ADVANCE,
    hasClosedGrants: true,
};

export const CAPITAL_STATE_SINGLE_TERM_LOAN: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT_LOAN,
    dynamicOffer: {
        ...DYNAMIC_OFFER_CONFIG_LOAN,
        estimatedRepaymentTermsInDays: [REPAYMENT_TERM_HALF],
    },
};

export const CAPITAL_STATE_SINGLE_TERM_CASH_ADVANCE: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT_CASH_ADVANCE,
    dynamicOffer: {
        ...DYNAMIC_OFFER_CONFIG_CASH_ADVANCE,
        estimatedRepaymentTermsInDays: [REPAYMENT_TERM_HALF],
    },
};

export const CAPITAL_STATE_ELIGIBLE_CA_LOAN: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT_LOAN,
    dynamicOffer: {
        ...DYNAMIC_OFFER_CONFIG_LOAN,
        minAmount: {
            ...DYNAMIC_OFFER_CONFIG_LOAN.minAmount,
            currency: 'CAD',
        },
        maxAmount: {
            ...DYNAMIC_OFFER_CONFIG_LOAN.maxAmount,
            currency: 'CAD',
        },
    },
    legalEntity: { region: 'CA' },
};

export const CAPITAL_STATE_ELIGIBLE_US_LOAN: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT_LOAN,
    dynamicOffer: {
        ...DYNAMIC_OFFER_CONFIG_LOAN,
        minAmount: {
            ...DYNAMIC_OFFER_CONFIG_LOAN.minAmount,
            currency: 'USD',
        },
        maxAmount: {
            ...DYNAMIC_OFFER_CONFIG_LOAN.maxAmount,
            currency: 'USD',
        },
    },
    legalEntity: { region: 'US' },
};

export const CAPITAL_STATE_PENDING_LOAN: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT_LOAN,
    activeOrPendingGrants: [PENDING_LOAN],
};

export const CAPITAL_STATE_PENDING_CASH_ADVANCE: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT_CASH_ADVANCE,
    activeOrPendingGrants: [PENDING_CASH_ADVANCE],
};

export const CAPITAL_STATE_ACTIONS_LOAN: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT_LOAN,
    activeOrPendingGrants: [ACTIONS_LOAN],
};

export const CAPITAL_STATE_ACTIONS_CASH_ADVANCE: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT_CASH_ADVANCE,
    activeOrPendingGrants: [ACTIONS_CASH_ADVANCE],
};

export const CAPITAL_STATE_SINGLE_ACTION_LOAN: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT_LOAN,
    activeOrPendingGrants: [SINGLE_ACTION_LOAN],
};

export const CAPITAL_STATE_SINGLE_ACTION_CASH_ADVANCE: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT_CASH_ADVANCE,
    activeOrPendingGrants: [SINGLE_ACTION_CASH_ADVANCE],
};

export const CAPITAL_STATE_ACTIVE: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT_LOAN,
    activeOrPendingGrants: [ACTIVE_LOAN],
};

export const CAPITAL_STATE_RENEWABLE_LOAN: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT_LOAN,
    activeOrPendingGrants: [RENEWABLE_LOAN],
    dynamicOffer: DYNAMIC_OFFER_CONFIG_LOAN,
};

export const CAPITAL_STATE_RENEWABLE_CASH_ADVANCE: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT_CASH_ADVANCE,
    activeOrPendingGrants: [RENEWABLE_CASH_ADVANCE],
    dynamicOffer: DYNAMIC_OFFER_CONFIG_CASH_ADVANCE,
};

export const CAPITAL_STATE_GRANTS_LOAN: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT_LOAN,
    activeOrPendingGrants: [RENEWING_ACTIVE_LOAN],
    hasClosedGrants: true,
};

export const CAPITAL_STATE_GRANTS_CASH_ADVANCE: ICapitalState = {
    ...CAPITAL_STATE_DEFAULT_CASH_ADVANCE,
    activeOrPendingGrants: [RENEWING_ACTIVE_CASH_ADVANCE],
    hasClosedGrants: true,
};

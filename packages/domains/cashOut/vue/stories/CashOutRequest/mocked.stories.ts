import type { Meta } from '@storybook/vue3';
import { ElementProps, type ElementStory as SharedElementStory } from '@integration-components/testing/storybook-helpers';
import { cashOutRequestMeta } from './meta';
import { CashOutRequestElement, type CashOutRequestExternalProps } from '../../src/CashOutRequest';
import { CASH_OUT_HANDLERS } from '../../../mocks/mock-server/cashOut';

type ElementStory = SharedElementStory<CashOutRequestExternalProps>;

const meta: Meta<ElementProps<typeof CashOutRequestElement>> = {
    ...cashOutRequestMeta,
    title: 'Mocked/CashOut/CashOut Request',
};

export const SingleTransferInstrument: ElementStory = {
    name: 'Single transfer instrument',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.singleTransferInstrument },
    },
};

export const SingleEligibleTransferInstrument: ElementStory = {
    name: 'Single eligible transfer instrument',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.singleEligibleTransferInstrument },
    },
};

export const IneligibleTransferInstruments: ElementStory = {
    name: 'Ineligible transfer instruments',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.withIneligibleTransferInstruments },
    },
};

export const FreeFees: ElementStory = {
    name: 'Free fees',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.freeFees },
    },
};

export const ZeroBalance: ElementStory = {
    name: 'Unavailable - Zero balance',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.zeroBalance },
    },
};

export const NoTransferInstruments: ElementStory = {
    name: 'Unavailable - No transfer instruments',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.noInstantReachableTransferInstruments },
    },
};

export const CashOutInProgress: ElementStory = {
    name: 'Unavailable - CashOut in progress',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.cashOutInProgress },
    },
};

export const DailyLimitReached: ElementStory = {
    name: 'Unavailable - Daily limit reached',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.dailyLimitReached },
    },
};

export const SendToBalanceAccountNotAllowed: ElementStory = {
    name: 'Unavailable - Send to balance account not allowed',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.sendToBalanceAccountNotAllowed },
    },
};

export const ReceiveFromBalanceAccountNotAllowed: ElementStory = {
    name: 'Unavailable - Receive from balance account not allowed',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.receiveFromBalanceAccountNotAllowed },
    },
};

export const RiskRestriction: ElementStory = {
    name: 'Unavailable - Risk restriction',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.riskRestricted },
    },
};

export const CashOutNotConfigured: ElementStory = {
    name: 'Unavailable - CashOut not configured',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.cashOutNotConfigured },
    },
};

export const RoleNotAssigned: ElementStory = {
    name: 'Error - Role not assigned',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.instructRoleNotAssigned },
    },
};

export const FeesError: ElementStory = {
    name: 'Error - Fees',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.feesInternalServerError },
    },
};

export const CashOutError: ElementStory = {
    name: 'Error - Cash out',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.instructInternalServerError },
    },
};

export const EligibilityError: ElementStory = {
    name: 'Error - Eligibility',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.eligibilityInternalServerError },
    },
};

export const BalanceAccountsError: ElementStory = {
    name: 'Error - Balance accounts',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.balanceAccountsInternalServerError },
    },
};

export default meta;

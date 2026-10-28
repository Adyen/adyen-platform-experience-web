import type { Meta, StoryObj } from '@storybook/vue3';
import { ElementProps } from '@integration-components/testing/storybook-helpers';
import { cashOutOverviewMeta } from './meta';
import { CashOutOverviewElement, type CashOutOverviewExternalProps } from '../../src/CashOutOverview';
import { CASH_OUT_HANDLERS } from '../../../mocks/mock-server/cashOut';

type ElementStory = StoryObj<CashOutOverviewExternalProps & { mockedApi?: boolean }>;

const meta: Meta<ElementProps<typeof CashOutOverviewElement>> = {
    ...cashOutOverviewMeta,
    title: 'Mocked/CashOut/CashOut Overview',
};

// The most complex happy flow: multiple balance accounts, and bank accounts that can and can't receive the cashOut.
export const Default: ElementStory = {
    name: 'Default',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.withIneligibleTransferInstruments },
    },
};

// The session gives one balance account: an account holder with a single one, or a session scoped to a balance account.
export const SingleBalanceAccount: ElementStory = {
    name: 'Single balance account (or balance account session)',
    args: { mockedApi: true },
    parameters: {
        msw: {
            handlers: [...CASH_OUT_HANDLERS.singleBalanceAccount.handlers, ...CASH_OUT_HANDLERS.withIneligibleTransferInstruments.handlers],
        },
    },
};

export const ZeroBalance: ElementStory = {
    name: 'Unavailable - Zero balance',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.zeroBalance },
    },
};

export const NoInstantReachableTransferInstruments: ElementStory = {
    name: 'Unavailable - No instant reachable transfer instruments',
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

export const RiskRestricted: ElementStory = {
    name: 'Unavailable - Risk restricted',
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

// Without the role to instruct a cashOut, the request in the modal shows the cashOut without "Cash out now".
export const ViewOnly: ElementStory = {
    name: 'View only - Role not assigned',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.instructRoleNotAssigned },
    },
};

// The fees load in the request modal, so this error shows once "Start instant CashOut" is clicked.
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

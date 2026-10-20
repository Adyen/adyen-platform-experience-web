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

export const MultipleBalanceAccounts: ElementStory = {
    name: 'Multiple balance accounts',
    args: {
        mockedApi: true,
    },
};

export const SingleBalanceAccount: ElementStory = {
    name: 'Single balance account',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.singleBalanceAccount },
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

import { setupWorker } from 'msw/browser';
import { getMockHandlers } from '@integration-components/testing/msw';
import { analyticsMock } from './eventDispatcher';
import { balanceAccountMock } from './balanceAccounts';
import { capitalDefaultHandlers as capitalMock } from '../../packages/domains/capital/mocks/mock-server';
import { disputesMocks } from '../../packages/domains/disputes/mocks/mock-server/disputes';
import { onboardingMocks } from './onboarding';
import { payByLinkMocks } from '../../packages/domains/payByLink/mocks/mock-server/payByLink';
import { payoutsMocks } from '../../packages/domains/payouts/mocks/mock-server/payouts';
import { reportsMock } from '../../packages/domains/reports/mocks/mock-server/reports';
import { sessionsMock } from './sessions';
import { setupMock } from './setup';
import { transactionsMocks } from '../../packages/domains/transactions/mocks/mock-server/transactions';

export const mocks = [
    analyticsMock,
    balanceAccountMock,
    capitalMock,
    disputesMocks,
    onboardingMocks,
    payByLinkMocks,
    payoutsMocks,
    reportsMock,
    sessionsMock,
    setupMock,
    transactionsMocks,
];
export const mockWorker = setupWorker(...getMockHandlers(mocks));

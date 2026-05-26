import { setupWorker } from 'msw/browser';
import { getMockHandlers } from '@integration-components/testing/msw';
import { analyticsMock } from './eventDispatcher';
import { balanceAccountMock } from './balanceAccounts';
import { capitalMock } from './capital';
import { disputesMocks } from '../../packages/domains/disputes/mocks/mock-server/disputes';
import { onboardingMocks } from './onboarding';
import { payByLinkMocks } from './payByLink';
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

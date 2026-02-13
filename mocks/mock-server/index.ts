import { setupWorker } from 'msw/browser';
import { getMockHandlers } from './utils/utils';
import { analyticsMock } from './analytics';
import { balanceAccountMock } from './balanceAccounts';
import { capitalMock } from './capital';
import { disputesMocks } from './disputes';
import { onboardingMocks } from './onboarding';
import { payByLinkMocks } from './payByLink';
import { payoutsMocks } from './payouts';
import { reportsMock } from './reports';
import { sessionsMock } from './sessions';
import { setupMock } from './setup';
import { transactionsMocks } from './transactions';

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

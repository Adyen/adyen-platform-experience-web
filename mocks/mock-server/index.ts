import { setupWorker } from 'msw/browser';
import { getMockHandlers } from './utils/utils';
import { balanceAccountMock } from './balanceAccounts';
import { payoutsMocks } from './payouts';
import { transactionsMocks } from './transactions';
import { reportsMock } from './reports';
import { sessionsMock } from './sessions';
import { analyticsMock } from './analytics';
import { setupMock } from './setup';
import { capitalMock } from './capital';
import { disputesMocks } from './disputes';
import { payByLinkMocks } from './payByLink';

export const mocks = [
    balanceAccountMock,
    payoutsMocks,
    transactionsMocks,
    analyticsMock,
    sessionsMock,
    setupMock,
    reportsMock,
    capitalMock,
    disputesMocks,
    payByLinkMocks,
];
export const mockWorker = setupWorker(...getMockHandlers(mocks));

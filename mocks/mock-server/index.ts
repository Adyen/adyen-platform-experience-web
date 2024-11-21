import { setupWorker } from 'msw/browser';
import { getMockHandlers } from './utils/utils';
import { balanceAccountMock } from './balanceAccounts';
import { payoutsMocks } from './payouts';
import { transactionsMocks } from './transactions';
import { reportsMock } from './reports';
import { sessionsMock } from './sessions';
import { setupMock } from './setup';
import { capitalMock } from './capital';

export const mocks = [balanceAccountMock, payoutsMocks, transactionsMocks, sessionsMock, setupMock, reportsMock, capitalMock];
export const mockWorker = setupWorker(...getMockHandlers(mocks));

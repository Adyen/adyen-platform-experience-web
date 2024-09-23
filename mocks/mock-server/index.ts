import { setupWorker } from 'msw/browser';
import { getMockHandlers } from './utils';
import { balanceAccountMock } from './balanceAccounts';
import { payoutsMocks } from './payouts';
import { transactionsMocks } from './transactions';
import { reportsMock } from './reports';
import { sessionsMock } from './sessions';
import { setupMock } from './setup';

export const mocks = [balanceAccountMock, payoutsMocks, transactionsMocks, sessionsMock, setupMock, reportsMock];
export const mockWorker = setupWorker(...getMockHandlers(mocks));

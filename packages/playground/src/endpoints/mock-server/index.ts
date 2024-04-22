import { setupWorker } from 'msw';
import { getMockHandlers } from './utils';
import { transactionsMocks } from './transactions';
import { sessionsMock } from './sessions';
import { setupMock } from './setup';
import { balanceAccountMock } from './balanceAccounts';

const mocks = [transactionsMocks, sessionsMock, setupMock, balanceAccountMock];
export const mockWorker = setupWorker(...getMockHandlers(mocks));

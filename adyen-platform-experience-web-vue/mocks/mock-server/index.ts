import { setupWorker } from 'msw/browser';
import { getMockHandlers } from './utils/utils';
import { sessionsMock } from './sessions';
import { setupMock } from './setup';
import { balanceAccountMock } from './balanceAccounts';
import { reportsMock } from './reports';

export const mocks = [sessionsMock, setupMock, balanceAccountMock, reportsMock];
export const mockWorker = setupWorker(...getMockHandlers(mocks));

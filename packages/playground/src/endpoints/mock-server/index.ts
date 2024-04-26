import { setupWorker } from 'msw';
import { getMockHandlers } from './utils';
import { transactionsMocks } from './transactions';
import { sessionsMock } from './sessions';
import { setupMock } from './setup';
import { balanceAccountMock } from './balanceAccount';
import { datasetsMocks } from './dataset';
import { configurationMocks } from './configurationMocks';

const mocks = [transactionsMocks, sessionsMock, setupMock, balanceAccountMock, datasetsMocks, configurationMocks];
export const mockWorker = setupWorker(...getMockHandlers(mocks));

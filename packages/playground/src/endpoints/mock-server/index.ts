import { setupWorker } from 'msw';
import { getMockHandlers } from './utils';
import { transactionsMocks } from './transactions';
import { sessionsMock } from './sessions';
import { setupMock } from './setup';

const mocks = [transactionsMocks, sessionsMock, setupMock];
export const mockWorker = setupWorker(...getMockHandlers(mocks));

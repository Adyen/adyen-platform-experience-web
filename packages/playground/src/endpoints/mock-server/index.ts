import { setupWorker } from 'msw';
import { getMockHandlers } from './utils';
import { legalEntitiesMocks } from './legal-entities';
import { balanceAccountMocks } from './balance-account';
import { accountHolderMocks } from './account-holder';
import { transactionsMocks } from './transactions';
import { sessionsMock } from './sessions';
import { setupMock } from './setup';

const mocks = [legalEntitiesMocks, balanceAccountMocks, accountHolderMocks, transactionsMocks, sessionsMock, setupMock];
export const mockWorker = setupWorker(...getMockHandlers(mocks));

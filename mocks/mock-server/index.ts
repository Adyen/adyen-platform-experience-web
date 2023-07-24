import { setupWorker } from 'msw';
import { getMockHandlers } from './utils';
import { legalEntitiesMocks } from './endpoints/legal-entities';
import { balanceAccountMocks } from './endpoints/balance-account';
import { accountHolderMocks } from './endpoints/account-holder';
import { transactionsMocks } from './endpoints/transactions';

const mocks = [legalEntitiesMocks, balanceAccountMocks, accountHolderMocks, transactionsMocks];
export const mockWorker = setupWorker(...getMockHandlers(mocks));

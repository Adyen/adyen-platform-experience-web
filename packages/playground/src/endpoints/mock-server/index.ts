import { setupWorker } from 'msw';
import { getMockHandlers } from './utils';
import { legalEntitiesMocks } from './legal-entities';
import { balanceAccountMocks } from './balance-account';
import { accountHolderMocks } from './account-holder';
import { transactionsMocks } from './transactions';

const mocks = [legalEntitiesMocks, balanceAccountMocks, accountHolderMocks, transactionsMocks];
export const mockWorker = setupWorker(...getMockHandlers(mocks));

console.log(accountHolderMocks);
console.log(mocks);
console.log(mockWorker);

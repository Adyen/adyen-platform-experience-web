import { operations as BalanceAccountOps } from './resources/BalanceAccountsResource';
import { operations as TransactionsOps } from './resources/TransactionsResource';
import { components as SetupResource } from './resources/SetupResource';

export type EndpointName = SetupResource['schemas']['EndpointName'];

export type SetupEndpointResponse = SetupResource['schemas']['SetupEndpointResponse'];

export type SetupEndpoint = Record<EndpointName, SetupEndpointResponse>;

export type EndpointsOperations = BalanceAccountOps & TransactionsOps;

export type OperationParameters<Operation extends keyof EndpointsOperations> = EndpointsOperations[Operation]['parameters'];

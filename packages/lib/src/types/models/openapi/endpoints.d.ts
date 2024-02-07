import { operations as BalanceAccountOps } from './BalanceAccountsResource';
import { operations as TransactionsOps } from './TransactionsResource';
import { components as SetupResource } from './SetupResource';

export type EndpointName = SetupResource['schemas']['EndpointName'];

export type SetupEndpointResponse = SetupResource['schemas']['SetupEndpointResponse'];

export type SetupEndpoint = Record<EndpointName, SetupEndpointResponse>;

export type EndpointsOperations = BalanceAccountOps & TransactionsOps;

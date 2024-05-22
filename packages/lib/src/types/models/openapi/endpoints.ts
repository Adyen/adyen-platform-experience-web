import { operations as BalanceAccountOps } from './BalanceAccountsResource';
import { operations as TransactionsOps } from './TransactionsResource';
import { components as SetupResource } from './SetupResource';

export type EndpointsOperations = BalanceAccountOps & TransactionsOps;

export type EndpointName = Extract<keyof EndpointsOperations, SetupResource['schemas']['EndpointName']>;

export type SetupEndpointResponse = SetupResource['schemas']['SetupEndpointResponse'];

export type SetupEndpoint = Record<EndpointName, SetupEndpointResponse>;

export type OperationParameters<Operation extends keyof EndpointsOperations> = EndpointsOperations[Operation] extends { parameters: infer P }
    ? P
    : never;

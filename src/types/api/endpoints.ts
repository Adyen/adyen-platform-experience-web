import { operations as BalanceAccountOps } from './resources/BalanceAccountsResource';
import { operations as PaymentInstrumentsOps } from './resources/PaymentInstrumentsResource';
import { operations as PayoutsOps } from './resources/PayoutsResource';
import { operations as TransactionsOps } from './resources/TransactionsResource';
import { operations as ReportsOps } from './resources/ReportsResource';
import { components as SetupResource } from './resources/SetupResource';

export type EndpointsOperations = BalanceAccountOps & PaymentInstrumentsOps & PayoutsOps & TransactionsOps & ReportsOps;

export type EndpointName = Extract<keyof EndpointsOperations, SetupResource['schemas']['EndpointName']>;

type CSVEndpoints = 'downloadReport';

type JSONEndpoints = Exclude<EndpointName, CSVEndpoints>;

export type EndpointJSONData<T extends JSONEndpoints> = EndpointsOperations[T]['responses'][200]['content']['application/json'];

export type EndpointCSVData<T extends CSVEndpoints> = EndpointsOperations[T]['responses'][200]['content']['text/csv'];

export type EndpointData<T extends EndpointName> = T extends CSVEndpoints
    ? EndpointCSVData<T>
    : T extends JSONEndpoints
    ? EndpointJSONData<T>
    : never;

export type SetupEndpointResponse = SetupResource['schemas']['SetupEndpointResponse'];

export type SetupEndpoint = Record<EndpointName, SetupEndpointResponse>;

export type OperationParameters<Operation extends keyof EndpointsOperations> = EndpointsOperations[Operation] extends { parameters: infer P }
    ? P
    : never;

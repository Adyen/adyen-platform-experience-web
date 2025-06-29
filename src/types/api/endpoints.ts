import { operations as BalanceAccountOps } from './resources/BalanceAccountsResource';
import { operations as PayoutsOps } from './resources/PayoutsResource';
import { operations as TransactionsOps } from './resources/TransactionsResource';
import { operations as ReportsOps } from './resources/ReportsResource';
import { operations as CapitalOps } from './resources/CapitalResource';
import { operations as DisputesOps } from './resources/DisputesResource';
import { components as SetupResource } from './resources/SetupResource';

export type EndpointsOperations = BalanceAccountOps & CapitalOps & PayoutsOps & ReportsOps & TransactionsOps & DisputesOps;

export type EndpointName = Extract<keyof EndpointsOperations, SetupResource['schemas']['EndpointName']>;

type CSVEndpoints = 'downloadReport';

type JSONEndpoints = Exclude<EndpointName, CSVEndpoints | 'downloadDefenseDocument'>;

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

type ExtractResponseType<T> = T extends {
    responses: {
        200: {
            content: {
                [key: string]: infer R;
            };
        };
    };
}
    ? R
    : never;

export type SuccessResponse<Op extends keyof EndpointsOperations> = ExtractResponseType<EndpointsOperations[Op]>;

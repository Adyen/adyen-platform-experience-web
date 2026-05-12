import { operations as balanceAccountsOps } from './resources/BalanceAccountsResourceV1';
import { operations as payoutsOps } from './resources/PayoutsResourceV1';
import { operations as transactionsV1Ops } from './resources/TransactionsResourceV1';
import { operations as transactionsV2Ops } from './resources/TransactionsResourceV2';
import { operations as reportsOps } from './resources/ReportsResourceV1';
import { operations as disputesOps } from './resources/DisputesResourceV1';
import { operations as capitalGrantOfferOps } from './resources/CapitalGrantOffersResourceV1';
import { operations as capitalGrantsOps } from './resources/CapitalGrantsResourceV1';
import { operations as capitalMissingActionsOps } from './resources/CapitalMissingActionsResourceV1';
import { operations as analyticsOps } from './resources/PlatformComponentsUxdsResourceV1';
import { operations as payByLinkOps } from './resources/PayByLinkResourceV1';
import { operations as onboardingConfigurationOps } from './resources/OnboardingConfigurationResourceV1';
import { components as setupComponents } from './resources/SetupResourceV1';

export type EndpointsOperations = analyticsOps &
    balanceAccountsOps &
    capitalGrantOfferOps &
    capitalGrantsOps &
    capitalMissingActionsOps &
    onboardingConfigurationOps &
    payoutsOps &
    reportsOps &
    Omit<transactionsV1Ops, keyof transactionsV2Ops> &
    transactionsV2Ops &
    disputesOps &
    payByLinkOps & {};

export type EndpointName = Extract<keyof EndpointsOperations, setupComponents['schemas']['EndpointName']>;

type CSVEndpoints = 'downloadReport' | 'downloadTransactions';
// TODO: Remove exception for expirePayByLinkPaymentLink after BE changes the response from 200 to 204
type JSONEndpoints = Exclude<EndpointName, DownloadStreamEndpoint | 'expirePayByLinkPaymentLink'>;

export type DownloadStreamEndpoint = CSVEndpoints | 'downloadDefenseDocument';
export type EndpointDownloadStreamData = { blob: Blob; filename?: string };
export type EndpointJSONData<T extends JSONEndpoints> = EndpointsOperations[T]['responses'][200]['content']['application/json'];

export type EndpointData<T extends EndpointName> = T extends DownloadStreamEndpoint
    ? EndpointDownloadStreamData
    : T extends JSONEndpoints
      ? EndpointJSONData<T>
      : never;

export type SetupEndpointResponse = setupComponents['schemas']['SetupEndpointResponse'];

export type SetupEndpoint = Record<EndpointName, SetupEndpointResponse>;

export type OperationParameters<Operation extends keyof EndpointsOperations> = EndpointsOperations[Operation] extends { parameters: infer P }
    ? P
    : never;

export type ExtractResponseType<T> = T extends {
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

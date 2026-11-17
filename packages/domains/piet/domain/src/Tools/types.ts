import type { EndpointJSONData, OperationParameters } from '@integration-components/types/api/endpoints';
import type { PietTranslationKey } from '../shared/types';

/** Session endpoints Piet may call on behalf of the model. Read-only (`GET`) endpoints only. */
export type PietToolEndpoint =
    | 'getBalanceAccounts'
    | 'getCapitalState'
    | 'getDisputeDetail'
    | 'getDisputeList'
    | 'getPaymentLinks'
    | 'getPayout'
    | 'getPayouts'
    | 'getTransaction'
    | 'getTransactionTotals'
    | 'getTransactions';

/** The decoded JSON arguments the model passed to a tool. Untrusted: tools must validate what they read. */
export type ToolArguments = Record<string, unknown>;

type ToolQuery<Endpoint extends PietToolEndpoint> = OperationParameters<Endpoint> extends { query?: infer Query } ? Query : never;

type ToolPath<Endpoint extends PietToolEndpoint> = OperationParameters<Endpoint> extends { path: infer Path } ? Path : never;

export interface PietTool<Endpoint extends PietToolEndpoint = PietToolEndpoint> {
    /** Name the model calls the tool by. */
    name: string;
    /** Tells the model when and how to use the tool. */
    description: string;
    /** JSON Schema of the arguments object. */
    parameters: Record<string, unknown>;
    /** Session endpoint the tool calls. The tool is only offered when the session grants it. */
    endpoint: Endpoint;
    /** Shown to the user while the tool runs, e.g. "Looking up transactions". */
    statusKey: PietTranslationKey;
    /** Maps the model's arguments to the endpoint's query. Throws {@link ToolArgumentError} for invalid arguments. */
    query: (args: ToolArguments) => ToolQuery<Endpoint>;
    /** Maps the model's arguments to the endpoint's path parameters, for endpoints that address a single record. */
    path?: (args: ToolArguments) => ToolPath<Endpoint>;
    /** Reduces the API response to what the model needs, keeping the result small. */
    summarize: (data: EndpointJSONData<Endpoint>) => unknown;
}

/** Type-checks a tool against the generated API types of its endpoint, then widens it so tools can share one list. */
export const defineTool = <Endpoint extends PietToolEndpoint>(tool: PietTool<Endpoint>) => tool as unknown as PietTool;

/** Calls a session endpoint. Matches the signature of the functions on the session's `endpoints`. */
export type ToolEndpointCaller = (request: { signal?: AbortSignal }, params?: { query?: unknown; path?: unknown }) => Promise<unknown>;

import { paths as balanceAccountsPaths } from '@integration-components/types/api/resources/BalanceAccountsResourceV1';
import { paths as payoutsPaths } from '@integration-components/types/api/resources/PayoutsResourceV1';
import { paths as transactionsPathsV1 } from '@integration-components/types/api/resources/TransactionsResourceV1';
import { paths as transactionsPathsV2 } from '@integration-components/types/api/resources/TransactionsResourceV2';
import { paths as reportsPaths } from '@integration-components/types/api/resources/ReportsResourceV1';
import { _RequiresParameter } from '@integration-components/core/ConfigContext.types';

export type AllowedHttpMethods = 'get' | 'post';
export type AvailableVersions = 1 | 2;

type _EndpointUrl = reportsPaths & transactionsPathsV1 & transactionsPathsV2 & payoutsPaths & balanceAccountsPaths;
type _StripVersion<T extends keyof Record<string, any>> = T extends `/v${number}/${infer Rest}` ? `/${Rest}` : T;
type _WithVersion<T extends string, V extends AvailableVersions = 1> = T extends `${infer Rest}` ? `/v${V}${Rest}` : `/v${V}${T}`;

export type EndpointUrl = _StripVersion<keyof _EndpointUrl>;

type _Request<Path extends EndpointUrl, Method extends AllowedHttpMethods, Version extends AvailableVersions = 1> = {
    endpoint: Path;
    method: Method;
    version: Version;
};
type _ExtractParams<T, K extends keyof Record<string, any>> = T extends { [P in K]: infer R } ? R : never;

type _ExtractOperation<
    T extends Record<string, any>,
    Path extends EndpointUrl,
    Method extends AllowedHttpMethods,
    Version extends AvailableVersions = 1,
> = Method extends keyof T[_WithVersion<Path, Version>] ? T[_WithVersion<Path, Version>][Method] : T[_WithVersion<Path, Version>];

export type RequestArgs<Path extends EndpointUrl, Method extends AllowedHttpMethods, Version extends AvailableVersions = 1> =
    _RequiresParameter<_ExtractOperation<_EndpointUrl, Path, Method, Version>> extends true
        ? _Request<Path, Method, Version> & {
              params: _ExtractParams<_ExtractOperation<_EndpointUrl, Path, Method, Version>, 'parameters'>;
          }
        : _Request<Path, Method, Version>;

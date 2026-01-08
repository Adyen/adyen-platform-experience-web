import { paths as BalanceAccountPaths } from '../../../src/types/api/resources/BalanceAccountsResource';
import { paths as PayoutsPaths } from '../../../src/types/api/resources/PayoutsResource';
import { paths as TransactionsPaths } from '../../../src/types/api/resources/TransactionsResource';
import { paths as ReportsPaths } from '../../../src/types/api/resources/ReportsResource';
import { _RequiresParameter } from '../../../src/core/ConfigContext';

export type AllowedHttpMethods = 'get' | 'post';
export type AvailableVersions = 1 | 2;

type _EndpointUrl = ReportsPaths & TransactionsPaths & PayoutsPaths & BalanceAccountPaths;
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

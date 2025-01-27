import { paths as BalanceAccountPaths } from '../../../src/types/api/resources/BalanceAccountsResource';
import { paths as PayoutsPaths } from '../../../src/types/api/resources/PayoutsResource';
import { paths as TransactionsPaths } from '../../../src/types/api/resources/TransactionsResource';
import { paths as ReportsPaths } from '../../../src/types/api/resources/ReportsResource';
import { _RequiresParameter } from '../../../src/core/ConfigContext';

type _EndpointUrl = ReportsPaths & TransactionsPaths & PayoutsPaths & BalanceAccountPaths;

type _StripVersion<T extends keyof Record<string, any>> = T extends `/v${string}/${infer Rest}` ? `/${Rest}` : T;
type _WithVersion<T extends string, V extends AvailableVersions = 'v1'> = T extends `${infer Rest}` ? `/${V}${Rest}` : `/${V}${T}`;

type _Request<Path extends _StripVersion<keyof _EndpointUrl>, Version extends AvailableVersions> = { endpoint: Path; version?: Version };
type _ExtractParams<T, K extends keyof Record<string, any>> = T extends { [P in K]: infer R } ? R : never;

type _ExtractOperation<
    T extends Record<string, any>,
    Path extends _StripVersion<keyof _EndpointUrl>,
    Version extends AvailableVersions = 'v1'
> = T[_WithVersion<Path, Version>][keyof T[_WithVersion<Path, Version>]];

export type AvailableVersions = 'v1' | 'v2';

export type EndpointsUrl = _StripVersion<keyof _EndpointUrl>;

export type RequestArgs<Path extends _StripVersion<keyof _EndpointUrl>, Version extends AvailableVersions = 'v1'> = _RequiresParameter<
    _ExtractOperation<_EndpointUrl, Path, Version>
> extends true
    ? _Request<Path, Version> & {
          params: _ExtractParams<_ExtractOperation<_EndpointUrl, Path, Version>, 'parameters'>;
      }
    : _Request<Path, Version>;

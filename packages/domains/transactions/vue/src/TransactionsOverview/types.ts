import type { IBalanceAccountBase, ITransaction } from '@integration-components/types';
import type { TransactionsFilters, TransactionsOverviewDomainProps } from '../integration/types';

export type { TransactionsCustomColumn, TransactionsListCustomization, TransactionsTableFields } from '../../../domain/src';

export type { TransactionsFilters };
export type TransactionsOverviewProps = TransactionsOverviewDomainProps;
export type TransactionsOverviewExternalProps = TransactionsOverviewDomainProps;

export interface TransactionsListResponse {
    data?: ITransaction[];
    _links?: {
        next?: { cursor: string };
        prev?: { cursor: string };
    };
}

export type { IBalanceAccountBase };

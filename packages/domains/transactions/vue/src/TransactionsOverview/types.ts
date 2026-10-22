import type { UIElementProps } from '@integration-components/core/vue';
import type { TransactionsOverviewProps } from '../../../domain/src';
import type {
    GlobalAppearance,
    IAmount,
    ITransaction,
    ITransactionCategory,
    ITransactionStatus,
    WithDataGridAppearance,
} from '@integration-components/types';

export type { IBalanceAccountBase } from '@integration-components/types';
export type { TransactionsCustomColumn, TransactionsDataGridCustomization, TransactionsTableFields } from '../../../domain/src';

export type TransactionsOverviewAppearance = GlobalAppearance & WithDataGridAppearance;

export interface TransactionsFilters {
    balanceAccountId?: string;
    categories: readonly ITransactionCategory[];
    statuses: readonly ITransactionStatus[];
    currencies: readonly IAmount['currency'][];
    createdSince: string;
    createdUntil: string;
    paymentPspReference?: string;
}

export type TransactionsOverviewExternalProps = UIElementProps<TransactionsOverviewAppearance> & TransactionsOverviewProps;
export type TransactionsOverviewComponentProps = Omit<TransactionsOverviewExternalProps, 'core' | 'appearance'>;

export interface TransactionsListResponse {
    data?: ITransaction[];
    _links?: {
        next?: { cursor: string };
        prev?: { cursor: string };
    };
}

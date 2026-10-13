import type { UIElementProps } from '@integration-components/core/vue';
import type { TransactionDetailsCustomization, TransactionsDataGridCustomization } from '../../../domain/src';
import type { IAmount, IBalanceAccountBase, ITransaction, ITransactionCategory, ITransactionStatus } from '@integration-components/types';
import type { PaginationProps } from '@integration-components/utils';

export type { TransactionsCustomColumn, TransactionsDataGridCustomization, TransactionsTableFields } from '../../../domain/src';

export interface TransactionsFilters {
    balanceAccountId?: string;
    categories: readonly ITransactionCategory[];
    statuses: readonly ITransactionStatus[];
    currencies: readonly IAmount['currency'][];
    createdSince: string;
    createdUntil: string;
    paymentPspReference?: string;
}

export interface TransactionsOverviewExternalProps extends UIElementProps, PaginationProps {
    balanceAccountId?: string;
    onContactSupport?: () => void;
    onRecordSelection?: (selection: { id: string; showModal: () => void }) => any;
    dataCustomization?: {
        dataGrid?: TransactionsDataGridCustomization;
        details?: TransactionDetailsCustomization;
    };
}

export interface TransactionsListResponse {
    data?: ITransaction[];
    _links?: {
        next?: { cursor: string };
        prev?: { cursor: string };
    };
}

export type { IBalanceAccountBase };

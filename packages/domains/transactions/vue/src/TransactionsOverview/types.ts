import type { UIElementProps } from '@integration-components/core/vue';
import type { TransactionDetailsCustomization, TransactionsListCustomization } from '../../../domain/src';
import type { IBalanceAccountBase, ITransaction } from '@integration-components/types';

export type { TransactionsCustomColumn, TransactionsListCustomization, TransactionsTableFields } from '../../../domain/src';
export type { TransactionsFilters } from '../../../domain/src/TransactionsOverview/types';

export interface TransactionsOverviewExternalProps extends UIElementProps {
    balanceAccountId?: string;
    allowLimitSelection?: boolean;
    preferredLimit?: number;
    hideTitle?: boolean;
    showDetails?: boolean;
    onContactSupport?: () => void;
    onFiltersChanged?: (filters: Record<string, string | undefined>) => any;
    onRecordSelection?: (selection: { id: string; showModal: () => void }) => any;
    dataCustomization?: {
        list?: TransactionsListCustomization;
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

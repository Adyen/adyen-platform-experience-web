import { OnSelection, TransactionFilterParam } from '@src/components';
import UIElement from '@src/components/external/UIElement';
import { Core } from '@src/core';
import { IBalanceAccountBase } from '@src/types';

export interface DataOverviewComponentProps {
    name?: string;
    elementRef?: UIElement<DataOverviewComponentProps> | null;
    onDataSelection?: OnSelection;
    onFiltersChanged?: (filters: { [P in TransactionFilterParam]?: string }) => any;
    onLimitChanged?: (limit: number) => any;
    preferredLimit?: 10 | 20;
    allowLimitSelection?: boolean;
    showDetails?: boolean;
    hideTitle?: boolean;
    core: Core;
    balanceAccountId?: string;
}

export interface BalanceAccountsProps {
    isFetchingBalanceAccounts: boolean;
    balanceAccounts: IBalanceAccountBase[];
    wrongBalanceAccountId: boolean;
}

export const enum DateFilterParam {
    CREATED_SINCE = 'createdSince',
    CREATED_UNTIL = 'createdUntil',
}

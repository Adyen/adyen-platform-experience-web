import { TransactionDetailData } from '@src/components';
import { Core } from '../../../core';
import UIElement from '../UIElement';

export const enum TransactionFilterParam {
    BALANCE_ACCOUNT = 'balanceAccount',
    CATEGORIES = 'categories',
    CURRENCIES = 'currencies',
    CREATED_SINCE = 'createdSince',
    CREATED_UNTIL = 'createdUntil',
    STATUSES = 'statuses',
    MIN_AMOUNT = 'minAmount',
    MAX_AMOUNT = 'maxAmount',
}

export const enum DateFilterParam {
    CREATED_SINCE = 'createdSince',
    CREATED_UNTIL = 'createdUntil',
}

export type OnSelection = (selection: { id: string; showModal: () => void }) => any;

export interface DataOverviewComponentProps {
    name?: string;
    elementRef?: UIElement<DataOverviewComponentProps> | null;
    onDataSelection?: OnSelection;
    onFiltersChanged?: (filters: { [P in TransactionFilterParam]?: string }) => any;
    onLimitChanged?: (limit: number) => any;
    preferredLimit?: 10 | 20;
    allowLimitSelection?: boolean;
    showDetails?: boolean;
    core: Core;
    balanceAccountId?: string;
}

export interface OverviewComponentProps extends DataOverviewComponentProps {
    type: 'payouts' | 'transactions';
}
export interface BalanceAccountProps {
    balanceAccountDescription?: string;
}

export type DetailsOptions = {
    transaction?: boolean;
};
export type SelectedDetail = {
    data: string | TransactionDetailData;
};

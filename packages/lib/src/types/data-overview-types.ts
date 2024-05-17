import UIElement from '../components/external/UIElement';
import { Core } from '../core';

export type OnSelection = (selection: { id: string; showModal: () => void }) => any;

export interface DataOverviewComponentProps {
    name?: string;
    elementRef?: UIElement<DataOverviewComponentProps> | null;
    onRecordSelection?: OnSelection;
    onFiltersChanged?: (filters: { [P in FilterParam]?: string }) => any;
    onLimitChanged?: (limit: number) => any;
    preferredLimit?: 10 | 20;
    allowLimitSelection?: boolean;
    showDetails?: boolean;
    hideTitle?: boolean;
    core: Core;
    balanceAccountId?: string;
}

export const enum FilterParam {
    BALANCE_ACCOUNT = 'balanceAccount',
    CATEGORIES = 'categories',
    CURRENCIES = 'currencies',
    CREATED_SINCE = 'createdSince',
    CREATED_UNTIL = 'createdUntil',
    STATUSES = 'statuses',
    MIN_AMOUNT = 'minAmount',
    MAX_AMOUNT = 'maxAmount',
}

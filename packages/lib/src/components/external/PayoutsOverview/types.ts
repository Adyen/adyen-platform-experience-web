import { OnSelection, TransactionFilterParam } from '@src/components';
import UIElement from '@src/components/external/UIElement';
import { Core } from '@src/core';

export const enum PayoutsFilterParam {
    CREATED_SINCE = 'createdSince',
    CREATED_UNTIL = 'createdUntil',
}
export interface PayoutsComponentProps {
    name?: string;
    elementRef?: UIElement<PayoutsComponentProps> | null;
    onPayoutSelected?: OnSelection;
    onFiltersChanged?: (filters: { [P in TransactionFilterParam]?: string }) => any;
    onLimitChanged?: (limit: number) => any;
    preferredLimit?: 10 | 20;
    allowLimitSelection?: boolean;
    showDetails?: boolean;
    core: Core;
    balanceAccountId?: string;
}

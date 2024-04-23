import { OnSelection } from '@src/components';
import UIElement from '@src/components/external/UIElement';
import { Core } from '@src/core';
import { FilterParam } from '@src/types';
export interface PayoutsComponentProps {
    name?: string;
    elementRef?: UIElement<PayoutsComponentProps> | null;
    onPayoutSelected?: OnSelection;
    onFiltersChanged?: (filters: { [P in FilterParam]?: string }) => any;
    onLimitChanged?: (limit: number) => any;
    preferredLimit?: 10 | 20;
    allowLimitSelection?: boolean;
    showDetails?: boolean;
    core: Core;
    balanceAccountId?: string;
}

import { UIElement } from '@integration-components/core/vue';
import CashOutOverview from './components/CashOutOverview/CashOutOverview.vue';
import type { CashOutOverviewExternalProps } from './types';

export class CashOutOverviewElement extends UIElement<CashOutOverviewExternalProps> {
    public static readonly type = 'cashOutOverview' as const;

    constructor(props: CashOutOverviewExternalProps) {
        super(CashOutOverview, props, 'cashOutOverview');
    }
}

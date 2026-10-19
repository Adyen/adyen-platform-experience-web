import { UIElement } from '@integration-components/core/vue';
import CashOutOverview from './components/CashOutOverview/CashOutOverview.vue';
import type { CashOutOverviewExternalProps } from './types';
import type { ExternalComponentType } from '@integration-components/types';

export class CashOutOverviewElement extends UIElement<CashOutOverviewExternalProps> {
    public static readonly type: ExternalComponentType = 'cashOutOverview';

    constructor(props: CashOutOverviewExternalProps) {
        super(CashOutOverview, props, 'cashOutOverview');
    }
}

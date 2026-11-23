import { UIElement } from '@integration-components/core/vue';
import { getExternalCashOutState, type ExternalCashOutState } from '@integration-components/cashOut/domain';
import CashOutOverview from './components/CashOutOverview/CashOutOverview.vue';
import type { CashOutOverviewExternalProps } from './types';

export class CashOutOverviewElement extends UIElement<CashOutOverviewExternalProps> {
    public static readonly type = 'cashOutOverview' as const;

    constructor(props: CashOutOverviewExternalProps) {
        super(CashOutOverview, props, 'cashOutOverview');
    }

    /**
     * Whether the CashOut components are available to the session and, once they are, what restricts its account holder from
     * cashing out at all. Decide which restrictions hide the components: more may be told in the future. Never rejects.
     */
    public async getState(): Promise<ExternalCashOutState> {
        return await getExternalCashOutState(this.core.session);
    }
}

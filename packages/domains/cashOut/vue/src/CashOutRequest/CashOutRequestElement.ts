import { UIElement } from '@integration-components/core/vue';
import { getExternalCashOutState, type ExternalCashOutState } from '@integration-components/cashOut/domain';
import CashOutRequestContainer from './components/CashOutRequestContainer.vue';
import type { CashOutRequestExternalProps } from './types';

export class CashOutRequestElement extends UIElement<CashOutRequestExternalProps> {
    public static readonly type = 'cashOutRequest' as const;

    constructor(props: CashOutRequestExternalProps) {
        super(CashOutRequestContainer, props, 'cashOutRequest');
    }

    /**
     * Whether the CashOut components are available to the session and, once they are, what restricts its account holder from
     * cashing out at all. Decide which restrictions hide the components: more may be told in the future. Never rejects.
     */
    public async getState(): Promise<ExternalCashOutState> {
        return await getExternalCashOutState(this.core.session);
    }
}

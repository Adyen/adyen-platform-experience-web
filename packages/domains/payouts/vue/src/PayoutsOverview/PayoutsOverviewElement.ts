import { UIElement } from '@integration-components/core/vue';
import PayoutsOverviewContainer from './components/PayoutsOverviewContainer.vue';
import type { ExternalComponentType } from '@integration-components/types';
import type { PayoutsOverviewExternalProps } from './types';

/**
 * Imperative wrapper for PayoutsOverview, mirroring the Preact BaseElement.mount() pattern.
 *
 * Usage:
 *   const core = await new Core({ ... }).initialize();
 *   const payoutsOverview = new PayoutsOverviewElement({ core, balanceAccountId: 'BA...' });
 *   payoutsOverview.mount('#payouts-container');
 *   payoutsOverview.update({ balanceAccountId: 'BA_NEW...' });
 *   payoutsOverview.unmount();
 */
export class PayoutsOverviewElement extends UIElement<PayoutsOverviewExternalProps> {
    public static readonly type: ExternalComponentType = 'payouts' as const;

    constructor(props: PayoutsOverviewExternalProps) {
        super(PayoutsOverviewContainer, props, 'payouts');
    }
}

export default PayoutsOverviewElement;

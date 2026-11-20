import { UIElement } from '@integration-components/core/vue';
import PayoutsOverviewContainer from './components/PayoutsOverviewContainer.vue';
import type { PayoutsOverviewExternalProps } from './types';

/**
 * Imperative wrapper for mounting PayoutsOverview.
 *
 * Usage:
 *   const core = await new Core({ ... }).initialize();
 *   const payoutsOverview = new PayoutsOverviewElement({ core });
 *   payoutsOverview.mount('#payouts-container');
 *   payoutsOverview.unmount();
 */
export class PayoutsOverviewElement extends UIElement<PayoutsOverviewExternalProps> {
    public static readonly type = 'payouts' as const;

    constructor(props: PayoutsOverviewExternalProps) {
        super(PayoutsOverviewContainer, props, 'payouts');
    }
}

export default PayoutsOverviewElement;

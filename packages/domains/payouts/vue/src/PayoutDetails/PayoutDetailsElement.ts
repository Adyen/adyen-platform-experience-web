import { UIElement } from '@integration-components/core/vue';
import PayoutDetailsContainer from './components/PayoutDetailsContainer.vue';
import type { ExternalComponentType } from '@integration-components/types';
import type { PayoutDetailsExternalProps } from './types';

/**
 * Imperative wrapper for mounting PayoutDetails.
 *
 * Usage:
 *   const core = await new Core({ ... }).initialize();
 *   const payoutDetails = new PayoutDetailsElement({
 *       core,
 *       id: 'BA...',
 *       date: '2024-04-25T00:00:00Z',
 *   });
 *   payoutDetails.mount('#payout-details-container');
 */
export class PayoutDetailsElement extends UIElement<PayoutDetailsExternalProps> {
    public static readonly type: ExternalComponentType = 'payoutDetails' as const;

    constructor(props: PayoutDetailsExternalProps) {
        super(PayoutDetailsContainer, props, 'payoutDetails');
    }
}

export default PayoutDetailsElement;

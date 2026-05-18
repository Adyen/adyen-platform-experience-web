import { UIElement } from '@integration-components/core/vue';
import PayoutDetailsContainer from './components/PayoutDetailsContainer.vue';
import type { PayoutDetailsExternalProps } from './types';

/**
 * Imperative wrapper for PayoutDetails, mirroring the Preact BaseElement.mount() pattern.
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
    constructor(props: PayoutDetailsExternalProps) {
        super(PayoutDetailsContainer, props, 'PayoutDetails');
    }
}

export default PayoutDetailsElement;

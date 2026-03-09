import { UIElement } from '../UIElement';
import PayoutDetailsWrapper from './PayoutDetailsWrapper.vue';
import type { PayoutDetailsExternalProps } from './types';

/**
 * Imperative wrapper for PayoutDetails, mirroring the Preact BaseElement.mount() pattern.
 *
 * Usage:
 *   const core = await AdyenPlatformExperienceVue({ ... });
 *   const payoutDetails = new PayoutDetailsElement({ core, id: 'BA...', date: '2025-...' });
 *   payoutDetails.mount('#payout-container');
 *   payoutDetails.update({ id: 'BA_NEW...' });
 *   payoutDetails.unmount();
 */
export class PayoutDetailsElement extends UIElement<PayoutDetailsExternalProps> {
    constructor(props: PayoutDetailsExternalProps) {
        super(PayoutDetailsWrapper, props);
    }
}

export default PayoutDetailsElement;

import { UIElement } from '../UIElement';
import TransactionDetailsWrapper from './TransactionDetailsWrapper.vue';
import type { TransactionDetailsExternalProps } from './types';

/**
 * Imperative wrapper for TransactionDetails, mirroring the Preact BaseElement.mount() pattern.
 *
 * Usage:
 *   const core = await AdyenPlatformExperienceVue({ ... });
 *   const transactionDetails = new TransactionDetailsElement({ core, id: 'TX...' });
 *   transactionDetails.mount('#transaction-container');
 *   transactionDetails.update({ id: 'TX_NEW...' });
 *   transactionDetails.unmount();
 */
export class TransactionDetailsElement extends UIElement<TransactionDetailsExternalProps> {
    constructor(props: TransactionDetailsExternalProps) {
        super(TransactionDetailsWrapper, props);
    }
}

export default TransactionDetailsElement;

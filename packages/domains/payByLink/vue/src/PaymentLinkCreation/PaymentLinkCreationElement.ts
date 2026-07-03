import { UIElement } from '@integration-components/core/vue';
import PaymentLinkCreationContainer from './components/PaymentLinkCreationContainer/PaymentLinkCreationContainer.vue';
import type { PaymentLinkCreationExternalProps } from './types';

/**
 * Imperative wrapper for PaymentLinkCreation, mirroring the Preact BaseElement.mount() pattern.
 */
export class PaymentLinkCreationElement extends UIElement<PaymentLinkCreationExternalProps> {
    constructor(props: PaymentLinkCreationExternalProps) {
        super(PaymentLinkCreationContainer, props, 'PaymentLinkCreation');
    }
}

export default PaymentLinkCreationElement;

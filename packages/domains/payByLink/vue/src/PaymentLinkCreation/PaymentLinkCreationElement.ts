import { UIElement } from '@integration-components/core/vue';
import type { ExternalComponentType } from '@integration-components/types';
import PaymentLinkCreationContainer from './components/PaymentLinkCreationContainer/PaymentLinkCreationContainer.vue';
import type { PaymentLinkCreationExternalProps } from './types';

/**
 * Imperative wrapper for mounting PaymentLinkCreation.
 */
export class PaymentLinkCreationElement extends UIElement<PaymentLinkCreationExternalProps> {
    public static readonly type: ExternalComponentType = 'paymentLinkCreation';

    constructor(props: PaymentLinkCreationExternalProps) {
        super(PaymentLinkCreationContainer, props, 'paymentLinkCreation');
    }
}

export default PaymentLinkCreationElement;

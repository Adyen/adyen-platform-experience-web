import { UIElement } from '@integration-components/core/vue';
import PaymentLinkDetails from './components/PaymentLinkDetails/PaymentLinkDetails.vue';
import type { PaymentLinkDetailsExternalProps } from './types';

export class PaymentLinkDetailsElement extends UIElement<PaymentLinkDetailsExternalProps> {
    constructor(props: PaymentLinkDetailsExternalProps) {
        super(PaymentLinkDetails, props, 'paymentLinkDetails');
    }
}

export default PaymentLinkDetailsElement;

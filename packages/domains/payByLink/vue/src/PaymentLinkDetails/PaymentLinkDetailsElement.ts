import { UIElement } from '@integration-components/core/vue';
import PaymentLinkDetails from './components/PaymentLinkDetails/PaymentLinkDetails.vue';
import type { PaymentLinkDetailsExternalProps } from './types';

export class PaymentLinkDetailsElement extends UIElement<PaymentLinkDetailsExternalProps> {
    public static readonly type = 'paymentLinkDetails' as const;

    constructor(props: PaymentLinkDetailsExternalProps) {
        super(PaymentLinkDetails, props, 'paymentLinkDetails');
    }
}

export default PaymentLinkDetailsElement;

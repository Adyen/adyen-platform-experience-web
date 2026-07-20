import { UIElement } from '@integration-components/core/vue';
import type { ExternalComponentType } from '@integration-components/types';
import PaymentLinkDetails from './components/PaymentLinkDetails/PaymentLinkDetails.vue';
import type { PaymentLinkDetailsExternalProps } from './types';

export class PaymentLinkDetailsElement extends UIElement<PaymentLinkDetailsExternalProps> {
    public static readonly type: ExternalComponentType = 'paymentLinkDetails';

    constructor(props: PaymentLinkDetailsExternalProps) {
        super(PaymentLinkDetails, props, 'paymentLinkDetails');
    }
}

export default PaymentLinkDetailsElement;

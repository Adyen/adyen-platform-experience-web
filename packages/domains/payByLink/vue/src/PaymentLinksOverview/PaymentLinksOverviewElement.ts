import { UIElement } from '@integration-components/core/vue';
import PaymentLinksOverviewContainer from './components/PaymentLinksOverviewContainer.vue';
import type { PaymentLinksOverviewExternalProps } from './types';

export class PaymentLinksOverviewElement extends UIElement<PaymentLinksOverviewExternalProps> {
    public static readonly type = 'paymentLinksOverview' as const;

    constructor(props: PaymentLinksOverviewExternalProps) {
        super(PaymentLinksOverviewContainer, props, 'paymentLinksOverview');
    }
}

export default PaymentLinksOverviewElement;

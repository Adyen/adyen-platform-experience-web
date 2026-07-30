import { UIElement } from '@integration-components/core/vue';
import PaymentLinksOverviewContainer from './components/PaymentLinksOverviewContainer.vue';
import type { PaymentLinksOverviewExternalProps } from './types';
import { ExternalComponentType } from '@integration-components/types';

export class PaymentLinksOverviewElement extends UIElement<PaymentLinksOverviewExternalProps> {
    public static readonly type: ExternalComponentType = 'paymentLinksOverview';

    constructor(props: PaymentLinksOverviewExternalProps) {
        super(PaymentLinksOverviewContainer, props, 'paymentLinksOverview');
    }
}

export default PaymentLinksOverviewElement;

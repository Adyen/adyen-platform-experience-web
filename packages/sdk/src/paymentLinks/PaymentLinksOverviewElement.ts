import type { CoreInstance } from '@integration-components/core/vue';
import type { PaymentLinksOverviewDomainProps } from '@integration-components/payByLink/vue/definitions';
import type { ExternalComponentType } from '@integration-components/types';
import { DomainComponent } from '../internal/DomainComponent';
import { bindPaymentLinksOverview } from './bindPaymentLinksOverview';

export interface PaymentLinksOverviewExternalProps extends PaymentLinksOverviewDomainProps {
    core: CoreInstance;
}

export class PaymentLinksOverviewElement extends DomainComponent<PaymentLinksOverviewDomainProps> {
    public static readonly type: ExternalComponentType = 'paymentLinksOverview';

    constructor({ core, ...props }: PaymentLinksOverviewExternalProps) {
        const integration = bindPaymentLinksOverview(core);
        super(core, props, PaymentLinksOverviewElement.type, 'Payment Links overview', nextProps => integration.create(nextProps));
    }
}

export default PaymentLinksOverviewElement;

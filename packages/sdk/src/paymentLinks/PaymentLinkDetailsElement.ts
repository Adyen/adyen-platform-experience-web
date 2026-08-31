import type { CoreInstance } from '@integration-components/core/vue';
import type { PaymentLinkDetailsDomainProps } from '@integration-components/payByLink/vue/definitions';
import type { ExternalComponentType } from '@integration-components/types';
import { DomainComponent } from '../internal/DomainComponent';
import { bindPaymentLinkDetails } from './bindPaymentLinkDetails';

export interface PaymentLinkDetailsExternalProps extends PaymentLinkDetailsDomainProps {
    core: CoreInstance;
}

export class PaymentLinkDetailsElement extends DomainComponent<PaymentLinkDetailsDomainProps> {
    public static readonly type: ExternalComponentType = 'paymentLinkDetails';

    constructor({ core, ...props }: PaymentLinkDetailsExternalProps) {
        const integration = bindPaymentLinkDetails(core);
        super(core, props, PaymentLinkDetailsElement.type, 'Payment Link details', nextProps => integration.create(nextProps));
    }
}

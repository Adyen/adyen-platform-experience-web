import type { CoreInstance } from '@integration-components/core/vue';
import type { PaymentLinkCreationDomainProps } from '@integration-components/payByLink/vue/definitions';
import type { ExternalComponentType } from '@integration-components/types';
import { DomainComponent } from '../internal/DomainComponent';
import { bindPaymentLinkCreation } from './bindPaymentLinkCreation';

export interface PaymentLinkCreationExternalProps extends PaymentLinkCreationDomainProps {
    core: CoreInstance;
}

export class PaymentLinkCreationElement extends DomainComponent<PaymentLinkCreationDomainProps> {
    public static readonly type: ExternalComponentType = 'paymentLinkCreation';

    constructor({ core, ...props }: PaymentLinkCreationExternalProps) {
        const integration = bindPaymentLinkCreation(core);
        super(core, props, PaymentLinkCreationElement.type, 'Payment Link creation', nextProps => integration.create(nextProps));
    }
}

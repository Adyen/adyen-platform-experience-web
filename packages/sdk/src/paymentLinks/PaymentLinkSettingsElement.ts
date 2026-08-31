import type { CoreInstance } from '@integration-components/core/vue';
import type { PaymentLinkSettingsDomainProps } from '@integration-components/payByLink/vue/definitions';
import type { ExternalComponentType } from '@integration-components/types';
import { DomainComponent } from '../internal/DomainComponent';
import { bindPaymentLinkSettings } from './bindPaymentLinkSettings';

export interface PaymentLinkSettingsExternalProps extends PaymentLinkSettingsDomainProps {
    core: CoreInstance;
}

export class PaymentLinkSettingsElement extends DomainComponent<PaymentLinkSettingsDomainProps> {
    public static readonly type: ExternalComponentType = 'paymentLinkSettings';

    constructor({ core, ...props }: PaymentLinkSettingsExternalProps) {
        const integration = bindPaymentLinkSettings(core);
        super(core, props, PaymentLinkSettingsElement.type, 'Payment Link settings', nextProps => integration.create(nextProps));
    }
}

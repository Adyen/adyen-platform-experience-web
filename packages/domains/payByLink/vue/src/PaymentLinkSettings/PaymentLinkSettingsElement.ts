import { UIElement } from '@integration-components/core/vue';
import type { ExternalComponentType } from '@integration-components/types';
import PaymentLinkSettingsContainer from './components/PaymentLinkSettingsContainer.vue';
import type { PaymentLinkSettingsExternalProps } from './types';

/**
 * Imperative wrapper for PaymentLinkSettings, mirroring the Preact BaseElement.mount() pattern.
 *
 * Usage:
 *   const core = await new Core({ ... }).initialize();
 *   const paymentLinkSettings = new PaymentLinkSettingsElement({ core });
 *   paymentLinkSettings.mount('#payment-link-settings-container');
 */
export class PaymentLinkSettingsElement extends UIElement<PaymentLinkSettingsExternalProps> {
    public static readonly type: ExternalComponentType = 'paymentLinkSettings';

    constructor(props: PaymentLinkSettingsExternalProps) {
        super(PaymentLinkSettingsContainer, props, 'paymentLinkSettings');
    }
}

export default PaymentLinkSettingsElement;

import type { Meta } from '@storybook/vue3';
import type { PaymentLinkSettingsExternalProps } from '../../src';
import PaymentLinkSettings from '../../src/PaymentLinkSettings/PaymentLinkSettingsWrapper.vue';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const PaymentLinkSettingsMeta: Meta<ElementProps<PaymentLinkSettingsExternalProps>> = {
    title: 'Components/Pay by Link/Payment Link Settings',
    component: PaymentLinkSettings,
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        hideTitle: { control: 'boolean' },
    },
    args: {
        component: PaymentLinkSettings,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

import type { Meta } from '@storybook/vue3';
import type { PaymentLinkSettingsExternalProps } from '../../src';
import PaymentLinkSettingsElement from '../../src/PaymentLinkSettings/PaymentLinkSettingsElement';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const PaymentLinkSettingsMeta: Meta<ElementProps<PaymentLinkSettingsExternalProps>> = {
    title: 'Components/Pay by Link/Payment Link Settings',
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        hideTitle: { control: 'boolean' },
    },
    args: {
        component: PaymentLinkSettingsElement,
        compact: true,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

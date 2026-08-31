import type { Meta } from '@storybook/vue3';
import { PaymentLinkSettingsDefinition, type PaymentLinkSettingsDomainProps } from '../../src/definitions';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const PaymentLinkSettingsMeta: Meta<ElementProps<PaymentLinkSettingsDomainProps>> = {
    title: 'Components/Pay by Link/Payment Link Settings',
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        hideTitle: { control: 'boolean' },
    },
    args: {
        component: PaymentLinkSettingsDefinition,
        compact: true,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

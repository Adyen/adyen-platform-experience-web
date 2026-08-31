import type { Meta } from '@storybook/vue3';
import { PaymentLinkDetailsDefinition, type PaymentLinkDetailsDomainProps } from '../../src/definitions';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const PaymentLinkDetailsMeta: Meta<ElementProps<PaymentLinkDetailsDomainProps>> = {
    title: 'Components/Pay by Link/Payment Link Details',
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onDismiss: enabledDisabledCallbackRadioControls('onDismiss'),
        hideTitle: { control: 'boolean' },
        id: { control: 'text' },
    },
    args: {
        component: PaymentLinkDetailsDefinition,
        compact: true,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

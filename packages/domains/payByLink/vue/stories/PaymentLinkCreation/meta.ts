import type { Meta } from '@storybook/vue3';
import { PaymentLinkCreationDefinition, type PaymentLinkCreationDomainProps } from '../../src/definitions';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const PaymentLinkCreationMeta: Meta<ElementProps<PaymentLinkCreationDomainProps>> = {
    title: 'Components/Pay by Link/Payment Link Creation',
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onPaymentLinkCreated: enabledDisabledCallbackRadioControls('onPaymentLinkCreated'),
        onCreationDismiss: enabledDisabledCallbackRadioControls('onCreationDismiss'),
        onShowDetails: enabledDisabledCallbackRadioControls('onShowDetails'),
        hideTitle: { control: 'boolean' },
    },
    args: {
        component: PaymentLinkCreationDefinition,
        compact: true,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

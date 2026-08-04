import type { Meta } from '@storybook/vue3';
import type { PaymentLinkCreationExternalProps } from '../../src';
import PaymentLinkCreation from '../../src/PaymentLinkCreation/PaymentLinkCreationWrapper.vue';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const PaymentLinkCreationMeta: Meta<ElementProps<PaymentLinkCreationExternalProps>> = {
    title: 'Components/Pay by Link/Payment Link Creation',
    component: PaymentLinkCreation,
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onPaymentLinkCreated: enabledDisabledCallbackRadioControls('onPaymentLinkCreated'),
        onCreationDismiss: enabledDisabledCallbackRadioControls('onCreationDismiss'),
        onShowDetails: enabledDisabledCallbackRadioControls('onShowDetails'),
        hideTitle: { control: 'boolean' },
    },
    args: {
        component: PaymentLinkCreation,
        compact: true,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

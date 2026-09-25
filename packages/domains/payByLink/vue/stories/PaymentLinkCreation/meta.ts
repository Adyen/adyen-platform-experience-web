import type { Meta } from '@storybook/vue3';
import type { PaymentLinkCreationExternalProps } from '../../src';
import PaymentLinkCreationElement from '../../src/PaymentLinkCreation/PaymentLinkCreationElement';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const PaymentLinkCreationMeta: Meta<ElementProps<PaymentLinkCreationExternalProps>> = {
    title: 'Components/Pay by Link/Payment Link Creation',
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onPaymentLinkCreated: enabledDisabledCallbackRadioControls('onPaymentLinkCreated'),
        onDismiss: enabledDisabledCallbackRadioControls('onDismiss'),
        onShowDetails: enabledDisabledCallbackRadioControls('onShowDetails'),
        hideTitle: { control: 'boolean' },
    },
    args: {
        component: PaymentLinkCreationElement,
        compact: true,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

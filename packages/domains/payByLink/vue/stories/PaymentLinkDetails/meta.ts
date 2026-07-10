import type { Meta } from '@storybook/vue3';
import type { PaymentLinkDetailsExternalProps } from '../../src';
import PaymentLinkDetails from '../../src/PaymentLinkDetails/PaymentLinkDetailsWrapper.vue';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const PaymentLinkDetailsMeta: Meta<ElementProps<PaymentLinkDetailsExternalProps>> = {
    title: 'Components/Pay by Link/Payment Link Details',
    component: PaymentLinkDetails,
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onDismiss: enabledDisabledCallbackRadioControls('onDismiss'),
        hideTitle: { control: 'boolean' },
        id: { control: 'text' },
    },
    args: {
        component: PaymentLinkDetails,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

import type { Meta } from '@storybook/vue3';
import type { PaymentLinkDetailsExternalProps } from '../../src';
import PaymentLinkDetailsElement from '../../src/PaymentLinkDetails/PaymentLinkDetailsElement';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const PaymentLinkDetailsMeta: Meta<ElementProps<PaymentLinkDetailsExternalProps>> = {
    title: 'Components/Pay by Link/Payment Link Details',
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onDismiss: enabledDisabledCallbackRadioControls('onDismiss'),
        hideTitle: { control: 'boolean' },
        id: { control: 'text' },
    },
    args: {
        component: PaymentLinkDetailsElement,
        compact: true,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

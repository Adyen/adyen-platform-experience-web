import type { Meta } from '@storybook/vue3';
import type { PayoutDetailsExternalProps } from '../../src';
import PayoutDetailsElement from '../../src/PayoutDetails/PayoutDetailsElement';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const PayoutDetailsMeta: Meta<ElementProps<PayoutDetailsExternalProps>> = {
    title: 'Components/Payouts/Payout Details',
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onDismiss: enabledDisabledCallbackRadioControls('onDismiss'),
        hideTitle: { control: 'boolean' },
    },
    args: {
        component: PayoutDetailsElement,
        compact: true,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

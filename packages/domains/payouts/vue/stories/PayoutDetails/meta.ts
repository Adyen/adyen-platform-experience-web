import type { Meta } from '@storybook/vue3';
import type { PayoutDetailsExternalProps } from '../../src';
import PayoutDetails from '../../src/PayoutDetails/PayoutDetailsWrapper.vue';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const PayoutDetailsMeta: Meta<ElementProps<PayoutDetailsExternalProps>> = {
    title: 'Components/Payouts/Payout Details',
    component: PayoutDetails,
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        hideTitle: { control: 'boolean' },
    },
    args: {
        component: PayoutDetails,
        compact: true,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

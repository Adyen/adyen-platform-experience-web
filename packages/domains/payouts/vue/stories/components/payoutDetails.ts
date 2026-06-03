import type { Meta } from '@storybook/vue3';
import PayoutDetails from '../../src/PayoutDetails/PayoutDetailsWrapper.vue';

import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const PayoutDetailsMeta: Meta<ElementProps<typeof PayoutDetails>> = {
    title: 'Components/Payouts/Payout Details',
    component: PayoutDetails,
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
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

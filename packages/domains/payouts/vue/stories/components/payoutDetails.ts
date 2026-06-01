import type { Meta } from '@storybook/vue3';
import PayoutDetails from '../../src/PayoutDetails/PayoutDetailsWrapper.vue';

import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const PayoutDetailsMeta: Meta<ElementProps<typeof PayoutDetails>> = {
    title: 'Components/Payouts/Payout Details',
    component: PayoutDetails,
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        locale: {
            control: 'select',
            options: ['da-DK', 'de-DE', 'en-US', 'es-ES', 'fi-FI', 'fr-FR', 'it-IT', 'nl-NL', 'no-NO', 'pt-BR', 'sv-SE'],
        },
    },
    args: {
        component: PayoutDetails,
        locale: 'en-US',
        compact: true,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

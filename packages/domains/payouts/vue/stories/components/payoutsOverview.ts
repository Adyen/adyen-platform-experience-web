import type { Meta } from '@storybook/vue3';
import PayoutsOverview from '../../src/PayoutsOverview/PayoutsOverviewWrapper.vue';

import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const PayoutsOverviewMeta: Meta<ElementProps<typeof PayoutsOverview>> = {
    title: 'Components/Payouts/Payouts Overview',
    component: PayoutsOverview,
    argTypes: {
        onFiltersChanged: enabledDisabledCallbackRadioControls('onFiltersChanged', ['Passed', 'Not Passed']),
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onRecordSelection: enabledDisabledCallbackRadioControls('onRecordSelection'),
        preferredLimit: { control: { type: 'number', min: 1, max: 100 } },
        hideTitle: { control: 'boolean' },
        showDetails: { control: 'boolean' },
        allowLimitSelection: { control: 'boolean' },
        locale: {
            control: 'select',
            options: ['da-DK', 'de-DE', 'en-US', 'es-ES', 'fi-FI', 'fr-FR', 'it-IT', 'nl-NL', 'no-NO', 'pt-BR', 'sv-SE'],
        },
    },
    args: {
        component: PayoutsOverview,
        allowLimitSelection: true,
        showDetails: true,
        locale: 'en-US',
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

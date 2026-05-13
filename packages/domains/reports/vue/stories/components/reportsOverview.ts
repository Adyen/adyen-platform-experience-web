import type { Meta } from '@storybook/vue3';
import ReportsOverview from '../../src/ReportsOverview/ReportsOverviewWrapper.vue';

import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const ReportsOverviewMeta: Meta<ElementProps<typeof ReportsOverview>> = {
    title: 'Components/Reports/Reports Overview',
    component: ReportsOverview,
    argTypes: {
        onFiltersChanged: enabledDisabledCallbackRadioControls('onFiltersChanged', ['Passed', 'Not Passed']),
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        preferredLimit: { control: { type: 'number', min: 1, max: 100 } },
        hideTitle: { control: 'boolean' },
        allowLimitSelection: { control: 'boolean' },
        locale: {
            control: 'select',
            options: ['da-DK', 'de-DE', 'en-US', 'es-ES', 'fi-FI', 'fr-FR', 'it-IT', 'nl-NL', 'no-NO', 'pt-BR', 'sv-SE'],
        },
    },
    args: {
        component: ReportsOverview,
        allowLimitSelection: true,
        locale: 'en-US',
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

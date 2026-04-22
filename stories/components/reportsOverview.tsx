import { Meta } from '@storybook/preact';
import { ElementProps } from '@integration-components/testing/storybook-helpers';
import { ReportsOverview } from '../../src';
import { enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const ReportsOverviewMeta: Meta<ElementProps<typeof ReportsOverview>> = {
    title: 'screens/Reports',
    argTypes: {
        onFiltersChanged: enabledDisabledCallbackRadioControls('onFiltersChanged', ['Passed', 'Not Passed']),
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        preferredLimit: { type: 'number', min: 1, max: 100 },
        hideTitle: { type: 'boolean' },
        allowLimitSelection: { type: 'boolean' },
    },
    args: {
        allowLimitSelection: true,
        component: ReportsOverview,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

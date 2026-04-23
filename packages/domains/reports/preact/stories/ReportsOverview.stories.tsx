import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';
import { ReportsOverview } from '../publish/src';

const meta: Meta<ElementProps<typeof ReportsOverview>> = {
    title: 'Reports/Reports Overview (via package)',
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

export const Default: ElementStory<typeof ReportsOverview> = {
    name: 'Default (via package)',
    args: {
        mockedApi: true,
    },
};

export default meta;

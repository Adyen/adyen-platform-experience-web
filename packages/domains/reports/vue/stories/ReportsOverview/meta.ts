import type { Meta } from '@storybook/vue3';
import type { ReportsOverviewExternalProps } from '../../src';
import ReportsOverviewElement from '../../src/ReportsOverview/ReportsOverviewElement';
import { ElementProps, densityControl, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const ReportsOverviewMeta: Meta<ElementProps<ReportsOverviewExternalProps>> = {
    title: 'Components/Reports/Reports Overview',
    argTypes: {
        onFiltersChanged: enabledDisabledCallbackRadioControls('onFiltersChanged', ['Passed', 'Not Passed']),
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        preferredLimit: { control: { type: 'number', min: 1, max: 100 } },
        hideTitle: { control: 'boolean' },
        allowLimitSelection: { control: 'boolean' },
        density: densityControl(),
        appearance: { table: { disable: true } },
    },
    args: {
        component: ReportsOverviewElement,
        allowLimitSelection: true,
        density: 'default',
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

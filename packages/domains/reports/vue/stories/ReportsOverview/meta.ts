import type { Meta } from '@storybook/vue3';
import type { ReportsOverviewExternalProps } from '../../src';
import ReportsOverviewElement from '../../src/ReportsOverview/ReportsOverviewElement';
import { ElementProps, dataGridDensityControl, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const reportsOverviewMeta: Meta<ElementProps<ReportsOverviewExternalProps>> = {
    title: 'Components/Reports/Reports Overview',
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        pagination: { control: 'object' },
        dataGridDensity: dataGridDensityControl(),
        appearance: { table: { disable: true } },
    },
    args: {
        component: ReportsOverviewElement,
        pagination: { defaultLimit: 10, disableLimitSelection: false },
        dataGridDensity: 'default',
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

import type { Meta } from '@storybook/vue3';
import type { ReportsOverviewExternalProps } from '../../src';
import ReportsOverviewElement from '../../src/ReportsOverview/ReportsOverviewElement';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const reportsOverviewMeta: Meta<ElementProps<ReportsOverviewExternalProps>> = {
    title: 'Components/Reports/Reports Overview',
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        pagination: { control: 'object' },
    },
    args: {
        component: ReportsOverviewElement,
        pagination: { initialPageSize: 10, allowPageSizeSelection: true },
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

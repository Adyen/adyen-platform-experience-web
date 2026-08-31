import type { Meta } from '@storybook/vue3';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';
import { ReportsOverviewDefinition, type ReportsOverviewDomainProps } from '../../src/definitions';

export const ReportsOverviewMeta: Meta<ElementProps<ReportsOverviewDomainProps>> = {
    title: 'Components/Reports/Reports Overview',
    argTypes: {
        onFiltersChanged: enabledDisabledCallbackRadioControls('onFiltersChanged', ['Passed', 'Not Passed']),
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        preferredLimit: { control: { type: 'number', min: 1, max: 100 } },
        hideTitle: { control: 'boolean' },
        allowLimitSelection: { control: 'boolean' },
    },
    args: {
        component: ReportsOverviewDefinition,
        allowLimitSelection: true,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

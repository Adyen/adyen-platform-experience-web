import type { Meta } from '@storybook/vue3';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';
import type { DisputesOverviewExternalProps } from '../../src';
import DisputesOverview from '../../src/DisputesOverview/DisputesOverviewWrapper.vue';

export const DisputesOverviewMeta: Meta<ElementProps<DisputesOverviewExternalProps>> = {
    title: 'Components/Disputes/Disputes Overview',
    component: DisputesOverview,
    argTypes: {
        onFiltersChanged: enabledDisabledCallbackRadioControls('onFiltersChanged', ['Passed', 'Not Passed']),
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onRecordSelection: enabledDisabledCallbackRadioControls('onRecordSelection'),
        preferredLimit: { control: { type: 'number', min: 1, max: 100 } },
        hideTitle: { control: 'boolean' },
        showDetails: { control: 'boolean' },
        allowLimitSelection: { control: 'boolean' },
    },
    args: {
        component: DisputesOverview,
        allowLimitSelection: true,
        showDetails: true,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

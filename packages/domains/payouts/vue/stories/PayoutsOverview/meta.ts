import type { Meta } from '@storybook/vue3';
import type { PayoutsOverviewExternalProps } from '../../src';
import PayoutsOverviewElement from '../../src/PayoutsOverview/PayoutsOverviewElement';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const PayoutsOverviewMeta: Meta<ElementProps<PayoutsOverviewExternalProps>> = {
    title: 'Components/Payouts/Payouts Overview',
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
        component: PayoutsOverviewElement,
        allowLimitSelection: true,
        showDetails: true,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

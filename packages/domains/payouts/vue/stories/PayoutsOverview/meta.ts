import type { Meta } from '@storybook/vue3';
import type { PayoutsOverviewExternalProps } from '../../src';
import PayoutsOverviewElement from '../../src/PayoutsOverview/PayoutsOverviewElement';
import { ElementProps, dataGridDensityControl, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const payoutsOverviewMeta: Meta<ElementProps<PayoutsOverviewExternalProps>> = {
    title: 'Components/Payouts/Payouts Overview',
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onRecordSelection: enabledDisabledCallbackRadioControls('onRecordSelection'),
        preferredLimit: { control: { type: 'number', min: 1, max: 100 } },
        allowLimitSelection: { control: 'boolean' },
        dataGridDensity: dataGridDensityControl(),
        appearance: { table: { disable: true } },
    },
    args: {
        component: PayoutsOverviewElement,
        allowLimitSelection: true,
        dataGridDensity: 'default',
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

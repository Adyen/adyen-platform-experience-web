import type { Meta } from '@storybook/vue3';
import type { PayoutsOverviewExternalProps } from '../../src';
import PayoutsOverviewElement from '../../src/PayoutsOverview/PayoutsOverviewElement';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const payoutsOverviewMeta: Meta<ElementProps<PayoutsOverviewExternalProps>> = {
    title: 'Components/Payouts/Payouts Overview',
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onRecordSelection: enabledDisabledCallbackRadioControls('onRecordSelection'),
        pagination: { control: 'object' },
    },
    args: {
        component: PayoutsOverviewElement,
        pagination: { defaultLimit: 10, disableLimitSelection: false },
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

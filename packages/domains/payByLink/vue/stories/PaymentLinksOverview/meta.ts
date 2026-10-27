import type { Meta } from '@storybook/vue3';
import type { PaymentLinksOverviewExternalProps } from '../../src';
import PaymentLinksOverviewElement from '../../src/PaymentLinksOverview/PaymentLinksOverviewElement';
import { ElementProps, dataGridDensityControl, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const paymentLinksOverviewMeta: Meta<ElementProps<PaymentLinksOverviewExternalProps>> = {
    title: 'Components/Pay by Link/Payment Links Overview',
    argTypes: {
        onRecordSelection: enabledDisabledCallbackRadioControls('onRecordSelection'),
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        storeIds: { control: 'object' },
        pagination: { control: 'object' },
        dataGridDensity: dataGridDensityControl(),
        appearance: { table: { disable: true } },
    },
    args: {
        component: PaymentLinksOverviewElement,
        pagination: { defaultLimit: 10, disableLimitSelection: false },
        dataGridDensity: 'default',
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

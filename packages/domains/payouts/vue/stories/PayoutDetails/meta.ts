import type { Meta } from '@storybook/vue3';
import type { PayoutDetailsExternalProps } from '../../src';
import PayoutDetailsElement from '../../src/PayoutDetails/PayoutDetailsElement';
import { ElementProps, dataGridDensityControl, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const PayoutDetailsMeta: Meta<ElementProps<PayoutDetailsExternalProps>> = {
    title: 'Components/Payouts/Payout Details',
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        hideTitle: { control: 'boolean' },
        dataGridDensity: dataGridDensityControl(),
        appearance: { table: { disable: true } },
    },
    args: {
        component: PayoutDetailsElement,
        compact: true,
        dataGridDensity: 'default',
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

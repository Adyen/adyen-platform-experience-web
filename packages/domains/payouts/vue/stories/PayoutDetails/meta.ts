import type { Meta } from '@storybook/vue3';
import { PayoutDetailsDefinition, type PayoutDetailsDomainProps } from '../../src/definitions';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const PayoutDetailsMeta: Meta<ElementProps<PayoutDetailsDomainProps>> = {
    title: 'Components/Payouts/Payout Details',
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        hideTitle: { control: 'boolean' },
    },
    args: {
        component: PayoutDetailsDefinition,
        compact: true,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

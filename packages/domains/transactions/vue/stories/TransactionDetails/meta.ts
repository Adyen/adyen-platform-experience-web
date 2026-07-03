import type { Meta } from '@storybook/vue3';
import type { TransactionDetailsExternalProps } from '../../src';
import TransactionDetails from '../../src/TransactionDetails/TransactionDetailsWrapper.vue';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const TransactionDetailsMeta: Meta<ElementProps<TransactionDetailsExternalProps>> = {
    title: 'Components/Transactions/Transaction Details',
    component: TransactionDetails,
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        hideTitle: { control: 'boolean' },
        id: { control: 'text' },
    },
    args: {
        component: TransactionDetails,
        compact: true,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

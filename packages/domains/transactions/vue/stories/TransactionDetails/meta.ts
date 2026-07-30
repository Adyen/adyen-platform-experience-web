import type { Meta } from '@storybook/vue3';
import type { TransactionDetailsExternalProps } from '../../src';
import TransactionDetailsElement from '../../src/TransactionDetails/TransactionDetailsElement';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const TransactionDetailsMeta: Meta<ElementProps<TransactionDetailsExternalProps>> = {
    title: 'Components/Transactions/Transaction Details',
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        hideTitle: { control: 'boolean' },
        id: { control: 'text' },
    },
    args: {
        component: TransactionDetailsElement,
        compact: true,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

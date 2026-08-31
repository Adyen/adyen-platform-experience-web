import type { Meta } from '@storybook/vue3';
import { TransactionDetailsDefinition, type TransactionDetailsDomainProps } from '../../src/definitions';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const TransactionDetailsMeta: Meta<ElementProps<TransactionDetailsDomainProps>> = {
    title: 'Components/Transactions/Transaction Details',
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        hideTitle: { control: 'boolean' },
        id: { control: 'text' },
    },
    args: {
        component: TransactionDetailsDefinition,
        compact: true,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

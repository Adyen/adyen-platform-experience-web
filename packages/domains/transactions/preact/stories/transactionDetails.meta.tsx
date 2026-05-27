import { Meta } from '@storybook/preact';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';
import { TransactionDetails } from '@integration-components/transactions/publish';

export const TransactionDetailsMeta: Meta<ElementProps<typeof TransactionDetails>> = {
    title: 'screens/Transactions',
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        hideTitle: { type: 'boolean' },
        id: { type: 'string' },
        balanceAccountId: {
            table: {
                disable: true,
            },
        },
    },
    args: {
        component: TransactionDetails,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
    decorators: [Story => <div className="compact-component-wrapper">{Story()}</div>],
};

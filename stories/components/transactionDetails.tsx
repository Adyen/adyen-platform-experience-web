import { Meta } from '@storybook/preact';
import { enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';
import { TransactionDetails } from '../../src';
import { ElementProps } from '@integration-components/testing/storybook-helpers';

export const TransactionDetailsMeta: Meta<ElementProps<typeof TransactionDetails>> = {
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

import { Meta } from '@storybook/preact';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';
import { TransactionDetails } from '../../src';
import { ElementProps } from '../utils/types';

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

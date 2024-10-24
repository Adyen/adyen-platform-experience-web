import { Meta } from '@storybook/preact';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';
import { TransactionDetails } from '../../src';
import { ElementProps } from '../utils/types';

export const TransactionDetailsMeta: Meta<ElementProps<typeof TransactionDetails>> = {
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        hideTitle: { type: 'boolean' },
        id: { type: 'string' },
    },
    args: {
        hideTitle: false,
        onContactSupport: () => {},
        component: TransactionDetails,
        id: '254X7TAUWB140HW0',
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
    decorators: [Story => <div style={{ margin: 'auto', maxWidth: 500, width: '100%' }}>{Story()}</div>],
};

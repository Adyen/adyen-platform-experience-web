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
        id: '1VVF0D5V3709DX6D',
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

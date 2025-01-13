import { Meta } from '@storybook/preact';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';
import { TransactionDetails } from '../../src';
import { ElementProps } from '../utils/types';

export const TransactionDetailsMeta: (id: string) => Meta<ElementProps<typeof TransactionDetails>> = (id: string) => {
    return {
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
            hideTitle: false,
            onContactSupport: () => {},
            component: TransactionDetails,
            id: id,
        },
        parameters: {
            controls: {
                sort: 'alpha',
            },
        },
        decorators: [Story => <div style={{ margin: 'auto', maxWidth: 500, width: '100%' }}>{Story()}</div>],
    };
};

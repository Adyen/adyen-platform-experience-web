import { Meta } from '@storybook/preact';
import { ElementProps } from '../utils/types';
import { Cashout } from '../../src';

export const CashoutMeta: Meta<ElementProps<typeof Cashout>> = {
    argTypes: {
        accountKey: { type: 'string' },
        variant: {
            control: {
                type: 'select',
            },
            options: ['full', 'summary', 'button'],
        },
    },
    args: {
        component: Cashout,
        accountKey: 'AccountHolder.AH123321123123',
        variant: 'full',
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
    decorators: [Story => <div className="compact-component-wrapper">{Story()}</div>],
};

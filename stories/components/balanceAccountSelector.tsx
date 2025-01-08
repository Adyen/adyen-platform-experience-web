import { Meta } from '@storybook/preact';
import { BalanceAccountSelector } from '../../src';
import { ElementProps } from '../utils/types';

export const balanceAccountSelectorMeta: Meta<ElementProps<typeof BalanceAccountSelector>> = {
    argTypes: {},
    args: {
        component: BalanceAccountSelector,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};

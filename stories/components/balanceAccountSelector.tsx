import { Meta } from '@storybook/preact';
// [TODO]: Change import path (later) to '../../src'
import { BalanceAccountSelector } from '../../src/components/external/BalanceAccountSelector';
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

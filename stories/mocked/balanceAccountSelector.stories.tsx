import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory } from '../utils/types';
import { balanceAccountSelectorMeta } from '../components/balanceAccountSelector';
// [TODO]: Change import path (later) to '../../src'
import { BalanceAccountSelector } from '../../src/components/external/BalanceAccountSelector';
import { balanceAccountMock } from '../../mocks/mock-server/balanceAccounts';

const meta: Meta<ElementProps<typeof BalanceAccountSelector>> = { ...balanceAccountSelectorMeta, title: 'Mocked/Balance Account Selector' };

export const Standalone: ElementStory<typeof BalanceAccountSelector> = {
    name: 'Standalone',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: balanceAccountMock,
        },
    },
};

export const StandaloneWithID: ElementStory<typeof BalanceAccountSelector> = {
    ...Standalone,
    args: {
        ...Standalone.args,
        balanceAccountId: 'BA32272223222B5CTDQPM6W2G',
    },
};

export default meta;

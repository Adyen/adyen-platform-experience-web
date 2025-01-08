import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory } from '../utils/types';
import { balanceAccountSelectorMeta } from '../components/balanceAccountSelector';
import { balanceAccountMock } from '../../mocks/mock-server/balanceAccounts';
import { BalanceAccountSelector } from '../../src';

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

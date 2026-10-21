import type { Meta, StoryObj } from '@storybook/vue3';
import { ElementProps } from '@integration-components/testing/storybook-helpers';
import { cashOutRequestMeta } from './meta';
import { CashOutRequestElement, type CashOutRequestExternalProps } from '../../src/CashOutRequest';
import { CASH_OUT_HANDLERS } from '../../../mocks/mock-server/cashOut';

type ElementStory = StoryObj<CashOutRequestExternalProps & { mockedApi?: boolean }>;

const meta: Meta<ElementProps<typeof CashOutRequestElement>> = {
    ...cashOutRequestMeta,
    title: 'Mocked/CashOut/CashOut Request',
};

export const MultipleBalanceAccounts: ElementStory = {
    name: 'Multiple balance accounts',
    args: {
        mockedApi: true,
    },
};

export const SingleBalanceAccount: ElementStory = {
    name: 'Single balance account',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.singleBalanceAccount },
    },
};

export const EligibilityError: ElementStory = {
    name: 'Error - Eligibility',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.eligibilityInternalServerError },
    },
};

export const BalanceAccountsError: ElementStory = {
    name: 'Error - Balance accounts',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.balanceAccountsInternalServerError },
    },
};

export default meta;

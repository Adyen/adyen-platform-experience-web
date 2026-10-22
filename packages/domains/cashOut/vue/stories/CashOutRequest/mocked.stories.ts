import type { Meta } from '@storybook/vue3';
import { ElementProps, type ElementStory as SharedElementStory } from '@integration-components/testing/storybook-helpers';
import { cashOutRequestMeta } from './meta';
import { CashOutRequestElement, type CashOutRequestExternalProps } from '../../src/CashOutRequest';
import { CASH_OUT_HANDLERS } from '../../../mocks/mock-server/cashOut';

type ElementStory = SharedElementStory<CashOutRequestExternalProps>;

const meta: Meta<ElementProps<typeof CashOutRequestElement>> = {
    ...cashOutRequestMeta,
    title: 'Mocked/CashOut/CashOut Request',
};

export const MultipleBalanceAccounts: ElementStory = {
    name: 'Multiple balance accounts',
    args: { mockedApi: true, onDismiss: 'Enabled' },
};

export const SingleBalanceAccount: ElementStory = {
    name: 'Single balance account',
    args: { mockedApi: true, onDismiss: 'Enabled' },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.singleBalanceAccount },
    },
};

export const SingleTransferInstrument: ElementStory = {
    name: 'Single transfer instrument',
    args: { mockedApi: true, onDismiss: 'Enabled' },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.singleTransferInstrument },
    },
};

export const IneligibleTransferInstruments: ElementStory = {
    name: 'Ineligible transfer instruments',
    args: { mockedApi: true, onDismiss: 'Enabled' },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.withIneligibleTransferInstruments },
    },
};

export const CashOutInProgress: ElementStory = {
    name: 'Unavailable - CashOut in progress',
    args: { mockedApi: true, onDismiss: 'Enabled' },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.cashOutInProgress },
    },
};

export const FeesError: ElementStory = {
    name: 'Error - Fees',
    args: { mockedApi: true, onDismiss: 'Enabled' },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.feesInternalServerError },
    },
};

export const EligibilityError: ElementStory = {
    name: 'Error - Eligibility',
    args: { mockedApi: true, onDismiss: 'Enabled' },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.eligibilityInternalServerError },
    },
};

export const BalanceAccountsError: ElementStory = {
    name: 'Error - Balance accounts',
    args: { mockedApi: true, onDismiss: 'Enabled' },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.balanceAccountsInternalServerError },
    },
};

export default meta;

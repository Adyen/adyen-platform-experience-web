import type { Meta } from '@storybook/vue3';
import type { PayoutDetailsDomainProps } from '../../src/definitions';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import { CUSTOM_TRANSLATIONS, DATA_CUSTOMIZATION, DEFAULT_PAYOUT_DETAILS } from '../../../fixtures/data/PayoutDetails';
import { PAYOUT_DETAILS_HANDLERS } from '../../../mocks/mock-server/payouts';
import { PayoutDetailsMeta } from './meta';

const meta: Meta<ElementProps<PayoutDetailsDomainProps>> = {
    ...PayoutDetailsMeta,
    title: 'Mocked/Payouts/Payout Details',
};

const sharedArgs = {
    date: DEFAULT_PAYOUT_DETAILS.payout!.createdAt,
    id: DEFAULT_PAYOUT_DETAILS.balanceAccountId,
    mockedApi: true,
};

export const Default: ElementStory<PayoutDetailsDomainProps> = {
    name: 'Default',
    args: sharedArgs,
    parameters: {
        msw: { ...PAYOUT_DETAILS_HANDLERS.default },
    },
};

export const ErrorDetails: ElementStory<PayoutDetailsDomainProps> = {
    name: 'Error - Details',
    args: sharedArgs,
    parameters: {
        msw: { ...PAYOUT_DETAILS_HANDLERS.errorDetails },
    },
};

export const ErrorNotFound: ElementStory<PayoutDetailsDomainProps> = {
    name: 'Error - Not found',
    args: sharedArgs,
    parameters: {
        msw: { ...PAYOUT_DETAILS_HANDLERS.errorNotFound },
    },
};

export const DetailsRoleNotAssigned: ElementStory<PayoutDetailsDomainProps> = {
    name: 'Error - Role not assigned',
    args: sharedArgs,
    parameters: {
        msw: { ...PAYOUT_DETAILS_HANDLERS.permissionError },
    },
};

export const SumOfSameDayPayouts: ElementStory<PayoutDetailsDomainProps> = {
    name: 'Sum of same-day payouts',
    args: sharedArgs,
    parameters: {
        msw: { ...PAYOUT_DETAILS_HANDLERS.sumOfSameDayPayouts },
    },
};

export const DataCustomization: ElementStory<PayoutDetailsDomainProps> = {
    name: 'Data customization',
    args: {
        ...sharedArgs,
        coreOptions: {
            translations: { en_US: CUSTOM_TRANSLATIONS },
        },
        dataCustomization: { details: DATA_CUSTOMIZATION },
    },
    parameters: {
        msw: { ...PAYOUT_DETAILS_HANDLERS.default },
    },
};

export default meta;

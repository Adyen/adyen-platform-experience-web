import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import { CUSTOM_TRANSLATIONS, DATA_CUSTOMIZATION, DEFAULT_PAYOUT_DETAILS } from '../../../fixtures/data/PayoutDetails';
import { PAYOUT_DETAILS_HANDLERS } from '../../../mocks/mock-server/payouts';
import { PayoutDetails } from '../../src';
import { PayoutDetailsMeta } from './meta';

const meta: Meta<ElementProps<typeof PayoutDetails>> = { ...PayoutDetailsMeta, title: 'Mocked/Payouts/Payout Details' };

const sharedArgs = {
    date: DEFAULT_PAYOUT_DETAILS.payout!.createdAt,
    id: DEFAULT_PAYOUT_DETAILS.balanceAccountId,
    mockedApi: true,
};

export const Default: ElementStory<typeof PayoutDetails> = {
    name: 'Default',
    args: sharedArgs,
    parameters: {
        msw: { ...PAYOUT_DETAILS_HANDLERS.default },
    },
};

export const ErrorDetails: ElementStory<typeof PayoutDetails> = {
    name: 'Error - Details',
    args: sharedArgs,
    parameters: {
        msw: { ...PAYOUT_DETAILS_HANDLERS.errorDetails },
    },
};

export const SumOfSameDayPayouts: ElementStory<typeof PayoutDetails> = {
    name: 'Sum of same-day payouts',
    args: sharedArgs,
    parameters: {
        msw: { ...PAYOUT_DETAILS_HANDLERS.sumOfSameDayPayouts },
    },
};

export const DataCustomization: ElementStory<typeof PayoutDetails> = {
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

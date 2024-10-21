import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory } from '../utils/types';
import { capitalOfferMeta } from '../components/capitalOffer';
import { CapitalOffer } from '../../src';
import { DYNAMIC_CAPITAL_OFFER } from '../../mocks/mock-data';
import { CapitalMockedResponses } from '../../mocks/mock-server/capital';

const meta: Meta<ElementProps<typeof CapitalOffer>> = { ...capitalOfferMeta, title: 'Mocked/Capital Offer' };

export const Default: ElementStory<typeof CapitalOffer> = {
    name: 'Default',
    args: {
        mockedApi: true,
        externalDynamicOffersConfig: DYNAMIC_CAPITAL_OFFER,
    },
};

export const ErrorSomethingWentWrong: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Something went wrong with review offer',
    args: {
        mockedApi: true,
        externalDynamicOffersConfig: DYNAMIC_CAPITAL_OFFER,
    },
    parameters: {
        msw: {
            handlers: CapitalMockedResponses.reviewOfferWentWrong,
        },
    },
};

export const ErrorNoGrantAccountConfig: ElementStory<typeof CapitalOffer> = {
    name: 'Error - No grant account config',
    args: {
        mockedApi: true,
        externalDynamicOffersConfig: DYNAMIC_CAPITAL_OFFER,
    },
    parameters: {
        msw: {
            handlers: CapitalMockedResponses.noGrantAccountConfig,
        },
    },
};

export const ErrorNoPrimaryBalanceAccount: ElementStory<typeof CapitalOffer> = {
    name: 'Error - No Primary Balance Account',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalMockedResponses.missingPrimaryBalanceAccount,
        },
    },
};
export const ErrorExceededGrantLimit: ElementStory<typeof CapitalOffer> = {
    name: 'Error - Exceeded Grant Limit',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalMockedResponses.exceededGrantLimit,
        },
    },
};

export default meta;

import { ElementProps, ElementStory, SetupControls } from '../../utils/types';
import { CapitalOffer } from '../../../src';
import { CapitalOfferMockedResponses } from '../../../mocks/mock-server/capital';
import { Meta } from '@storybook/preact';
import { capitalOfferWithSetupMeta } from '../../components/capitalOffer';
import { ParameterAwareMockedStory } from '../utils/utils';
import { DYNAMIC_OFFER_CAPITAL_ERRORS, DYNAMIC_OFFER_CONFIG_CAPITAL_ERRORS, REQUEST_FUNDS_CAPITAL_ERRORS } from './constants';

const meta: Meta<ElementProps<typeof CapitalOffer> & SetupControls> = { ...capitalOfferWithSetupMeta, title: 'Mocked/Capital Offer/Errors' };

export const DynamicOfferConfig: ElementStory<typeof CapitalOffer, { error: any }> = {
    name: 'Dynamic offer config',
    argTypes: {
        error: {
            control: { type: 'select', labels: DYNAMIC_OFFER_CONFIG_CAPITAL_ERRORS },
            options: Object.keys(DYNAMIC_OFFER_CONFIG_CAPITAL_ERRORS),
        },
    },

    args: {
        error: 'no_config',
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOfferMockedResponses.dynamicOfferConfigErrors,
        },
    },
    decorators: [ParameterAwareMockedStory],
};

export const DynamicOffer: ElementStory<typeof CapitalOffer, { error: any }> = {
    name: 'Dynamic offer',
    argTypes: {
        error: {
            control: { type: 'select', labels: DYNAMIC_OFFER_CAPITAL_ERRORS },
            options: Object.keys(DYNAMIC_OFFER_CAPITAL_ERRORS),
        },
    },

    args: {
        error: 'generic',
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOfferMockedResponses.dynamicOfferErrors,
        },
    },
    decorators: [ParameterAwareMockedStory],
};

export const RequestFunds: ElementStory<typeof CapitalOffer, { error: any }> = {
    name: 'Request funds',
    argTypes: {
        error: {
            control: { type: 'select', labels: REQUEST_FUNDS_CAPITAL_ERRORS },
            options: Object.keys(REQUEST_FUNDS_CAPITAL_ERRORS),
        },
    },

    args: {
        error: 'generic',
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOfferMockedResponses.requestFundsErrors,
        },
    },
    decorators: [ParameterAwareMockedStory],
};

export const ErrorSomethingWentWrong: ElementStory<typeof CapitalOffer> = {
    name: 'Review offer',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: CapitalOfferMockedResponses.reviewOfferWentWrong,
        },
    },
};

export default meta;

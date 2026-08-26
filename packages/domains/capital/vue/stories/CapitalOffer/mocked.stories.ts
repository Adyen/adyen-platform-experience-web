import type { Meta } from '@storybook/vue3';
import type { CapitalOfferExternalProps } from '../../src';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import { capitalOfferMeta } from './meta';
import { capitalOfferHandlers } from '../../../mocks/mock-server';

const meta: Meta<ElementProps<CapitalOfferExternalProps>> = {
    ...capitalOfferMeta,
    title: 'Mocked/Capital/Capital Offer',
};

export const UnsupportedRegion: ElementStory<CapitalOfferExternalProps> = {
    name: 'Unsupported region',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.unsupportedRegion,
        },
    },
};

export const Ineligible: ElementStory<CapitalOfferExternalProps> = {
    name: 'Ineligible',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.ineligible,
        },
    },
};

export const Eligible: ElementStory<CapitalOfferExternalProps> = {
    name: 'Eligible',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.eligible,
        },
    },
};

export const ErrorOfferConfig: ElementStory<CapitalOfferExternalProps> = {
    name: 'Error - Offer config',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.errorOfferConfig,
        },
    },
};

export const ErrorAccountHolder: ElementStory<CapitalOfferExternalProps> = {
    name: 'Error - Account holder',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOfferHandlers.errorAccountHolder,
        },
    },
};

export default meta;

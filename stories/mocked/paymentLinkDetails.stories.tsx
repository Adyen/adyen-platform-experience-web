import { Meta } from '@storybook/preact';
import { PaymentLinkDetails } from '../../src';
import { PaymentLinkDetailsMeta } from '../components/paymentLinkDetails';
import { ElementProps, ElementStory } from '../utils/types';
import { PaymentLinkDetailsMockedResponses } from '../../mocks/mock-server/payByLink';

const meta: Meta<ElementProps<typeof PaymentLinkDetails>> = { ...PaymentLinkDetailsMeta, title: 'Mocked/Pay by Link/Payment Link Details' };

export const Default: ElementStory<typeof PaymentLinkDetails> = {
    name: 'Default',
    args: {
        id: 'PLTEST001',
        mockedApi: true,
    },
};

export const PaymentPending: ElementStory<typeof PaymentLinkDetails> = {
    name: 'Payment pending',
    args: {
        id: 'PLTEST003',
        mockedApi: true,
    },
};

export const Completed: ElementStory<typeof PaymentLinkDetails> = {
    name: 'Completed',
    args: {
        id: 'PLTEST026',
        mockedApi: true,
    },
};

export const Expired: ElementStory<typeof PaymentLinkDetails> = {
    name: 'Expired',
    args: {
        id: 'PLTEST027',
        mockedApi: true,
    },
};

export const Redacted: ElementStory<typeof PaymentLinkDetails> = {
    name: 'Redacted',
    args: {
        id: 'PLTEST001',
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: PaymentLinkDetailsMockedResponses.redacted,
        },
    },
};

export const ErrorDetails: ElementStory<typeof PaymentLinkDetails> = {
    name: 'Error - Details',
    args: {
        id: 'PLTEST001',
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: PaymentLinkDetailsMockedResponses.errorDetails,
        },
    },
};

export const ErrorExpiration: ElementStory<typeof PaymentLinkDetails> = {
    name: 'Error - Expire',
    args: {
        id: 'PLTEST001',
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: PaymentLinkDetailsMockedResponses.errorExpiration,
        },
    },
};

export default meta;

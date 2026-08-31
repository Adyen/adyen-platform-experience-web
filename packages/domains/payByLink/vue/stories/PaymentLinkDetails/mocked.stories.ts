import type { Meta } from '@storybook/vue3';
import { PaymentLinkDetailsMeta } from './meta';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import type { PaymentLinkDetailsExternalProps } from '../../src';
import { PaymentLinkDetailsMockedResponses } from '../../../mocks/mock-server/payByLink';

const meta: Meta<ElementProps<PaymentLinkDetailsExternalProps>> = {
    ...PaymentLinkDetailsMeta,
    title: 'Mocked/Pay by Link/Payment Link Details',
};

export const Default: ElementStory<PaymentLinkDetailsExternalProps> = {
    name: 'Default',
    args: {
        id: 'PLTEST001',
        mockedApi: true,
    },
};

export const PaymentPending: ElementStory<PaymentLinkDetailsExternalProps> = {
    name: 'Payment pending',
    args: {
        id: 'PLTEST003',
        mockedApi: true,
    },
};

export const Completed: ElementStory<PaymentLinkDetailsExternalProps> = {
    name: 'Completed',
    args: {
        id: 'PLTEST026',
        mockedApi: true,
    },
};

export const Expired: ElementStory<PaymentLinkDetailsExternalProps> = {
    name: 'Expired',
    args: {
        id: 'PLTEST027',
        mockedApi: true,
    },
};

export const Redacted: ElementStory<PaymentLinkDetailsExternalProps> = {
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

export const ErrorDetails: ElementStory<PaymentLinkDetailsExternalProps> = {
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

export const ErrorExpire: ElementStory<PaymentLinkDetailsExternalProps> = {
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

export const DetailsRoleNotAssigned: ElementStory<PaymentLinkDetailsExternalProps> = {
    name: 'Error - Role not assigned',
    args: {
        id: 'PLTEST001',
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: PaymentLinkDetailsMockedResponses.permissionError,
        },
    },
};

export default meta;

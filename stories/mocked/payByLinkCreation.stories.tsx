import { Meta } from '@storybook/preact';
import { PayByLinkCreation } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { PayByLinkCreationMeta } from '../components/payByLinkCreation';
import { action } from '@storybook/addon-actions';
import { PayByLinkCreationComponentProps } from '../../src/components/types';

const meta: Meta<ElementProps<typeof PayByLinkCreation>> = { ...PayByLinkCreationMeta, title: 'Mocked/Pay by link Creation' };

const fieldsConfig = {
    data: {
        amount: {
            currency: 'EUR',
            value: 12345,
        },
        deliveryAddress: {
            city: 'Madrid',
            country: 'ES',
            houseNumberOrName: '123',
            postalCode: '28001',
            street: 'Gran Via',
        },
        description: 'This is a test description',
        reference: 'SHP000001',
        linkType: 'open',
        deliverAt: '2025-12-09T11:39:24.458Z',
        shopperEmail: 'test@example.com',
        shopperLocale: 'en-US',
        shopperReference: 'test',
        shopperName: {
            firstName: 'John',
            lastName: 'Doe',
        },
        countryCode: 'ES',
        telephoneNumber: '+34 3002119220',
        linkValidity: {
            durationUnit: 'week',
            quantity: 3,
        },
    },
} satisfies PayByLinkCreationComponentProps['fieldsConfig'];

export const Default: ElementStory<typeof PayByLinkCreation> = {
    name: 'Default',
    args: {
        mockedApi: true,
        onPaymentLinkCreated: action('Payment link created'),
    },
};

export const Prefilled: ElementStory<typeof PayByLinkCreation> = {
    name: 'Prefilled',
    args: {
        mockedApi: true,
        onPaymentLinkCreated: action('Payment link created'),
        fieldsConfig,
    },
};

export default meta;

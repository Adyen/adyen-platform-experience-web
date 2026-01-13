import { Meta } from '@storybook/preact';
import { PaymentLinkCreation } from '../../src';
import { ElementProps, ElementStory, SessionControls } from '../utils/types';
import { PaymentLinkCreationMeta } from '../components/paymentLinkCreation';
import { EMPTY_SESSION_OBJECT } from '../utils/constants';
import { PaymentLinkCreationComponentProps } from '../../src/components/types';

const meta: Meta<ElementProps<typeof PaymentLinkCreation>> = { ...PaymentLinkCreationMeta, title: 'API-connected/Pay by Link/Payment Link Creation' };

const fieldsConfig = {
    data: {
        linkValidity: {
            durationUnit: 'hour',
            quantity: 48,
        },
        amount: {
            currency: 'EUR',
            value: 999,
        },
        reference: 'AAA12345',
        linkType: 'singleUse',
        description: 'Payment for goods/services',
        deliverAt: '2025-12-31T11:39:24.458Z',
        shopperReference: 'REF00001',
        shopperName: {
            firstName: 'Samuel',
            lastName: 'Sarabia',
        },
        shopperEmail: 'samuel.sarabia@adyen.com',
        telephoneNumber: '+57 3002119220',
        countryCode: 'CO',
        deliveryAddress: {
            city: 'Medellín',
            country: 'CO',
            houseNumberOrName: '123',
            postalCode: '11111',
            street: 'Calle 123',
        },
        billingAddress: {
            city: 'Bogotá',
            country: 'CO',
            houseNumberOrName: '123',
            postalCode: '11111',
            street: 'Carrera 66A #123-45',
        },
        // shopperLocale: 'es-ES',
    },
} satisfies PaymentLinkCreationComponentProps['fieldsConfig'];

export const Default: ElementStory<typeof PaymentLinkCreation, SessionControls> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
        // fieldsConfig,
    },
};

export default meta;

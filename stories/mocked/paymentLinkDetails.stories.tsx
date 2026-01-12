import { Meta } from '@storybook/preact';
import { PaymentLinkDetails } from '../../src';
import { PaymentLinkDetailsMeta } from '../components/paymentLinkDetails';
import { ElementProps, ElementStory } from '../utils/types';

const meta: Meta<ElementProps<typeof PaymentLinkDetails>> = { ...PaymentLinkDetailsMeta, title: 'Mocked/Pay by Link/Payment Link Details' };

export const Default: ElementStory<typeof PaymentLinkDetails> = {
    name: 'Default',
    args: {
        id: 'PLTEST001',
        mockedApi: true,
    },
};

export default meta;

import { Meta } from '@storybook/preact';
import { PaymentLinkDetails } from '../../src';
import { PaymentLinkDetailsMeta } from '../components/paymentLinkDetails';
import { ElementProps, ElementStory, SessionControls } from '../utils/types';
import { EMPTY_SESSION_OBJECT } from '../utils/constants';

const meta: Meta<ElementProps<typeof PaymentLinkDetails>> = { ...PaymentLinkDetailsMeta, title: 'API-connected/Pay By Link/Payment Link Details' };

export const Default: ElementStory<typeof PaymentLinkDetails, SessionControls> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
        id: 'PL45F0733C99EAE0BCA6AC210',
    },
};

export default meta;

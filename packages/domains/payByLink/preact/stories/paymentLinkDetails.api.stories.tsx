import { Meta } from '@storybook/preact';
import { PaymentLinkDetails } from '@integration-components/payByLink/publish';
import { ElementProps, ElementStory, SessionControls, EMPTY_SESSION_OBJECT } from '@integration-components/testing/storybook-helpers';
import { PaymentLinkDetailsMeta } from './paymentLinkDetails.meta';

const meta: Meta<ElementProps<typeof PaymentLinkDetails>> = { ...PaymentLinkDetailsMeta, title: 'API-connected/Pay by Link/Payment Link Details' };

export const Default: ElementStory<typeof PaymentLinkDetails, SessionControls> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
        id: 'PL0A7047CB5196A88513AD24B',
    },
};

export default meta;

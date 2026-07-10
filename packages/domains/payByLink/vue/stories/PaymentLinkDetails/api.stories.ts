import type { Meta } from '@storybook/vue3';
import { PaymentLinkDetailsMeta } from './meta';
import type { PaymentLinkDetailsExternalProps } from '../../src';
import { ElementProps, ElementStory, EMPTY_SESSION_OBJECT, SessionControls } from '@integration-components/testing/storybook-helpers';

const meta: Meta<ElementProps<PaymentLinkDetailsExternalProps>> = {
    ...PaymentLinkDetailsMeta,
    title: 'API-connected/Pay by Link/Payment Link Details',
};

export const Default: ElementStory<PaymentLinkDetailsExternalProps, SessionControls> = {
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

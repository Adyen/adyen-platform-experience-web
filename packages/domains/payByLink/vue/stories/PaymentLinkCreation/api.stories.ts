import type { Meta } from '@storybook/vue3';
import { PaymentLinkCreationMeta } from './meta';
import { ElementProps, ElementStory, SessionControls, EMPTY_SESSION_OBJECT } from '@integration-components/testing/storybook-helpers';
import type { PaymentLinkCreationExternalProps } from '../../src';

const meta: Meta<ElementProps<PaymentLinkCreationExternalProps>> = {
    ...PaymentLinkCreationMeta,
    title: 'API-connected/Pay by Link/Payment Link Creation',
};

export const Default: ElementStory<PaymentLinkCreationExternalProps, SessionControls> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;

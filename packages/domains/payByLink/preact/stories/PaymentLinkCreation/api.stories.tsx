import { Meta } from '@storybook/preact';
import { PaymentLinkCreation } from '../../src';
import { ElementProps, ElementStory, SessionControls, EMPTY_SESSION_OBJECT } from '@integration-components/testing/storybook-helpers';
import { PaymentLinkCreationMeta } from './meta';

const meta: Meta<ElementProps<typeof PaymentLinkCreation>> = { ...PaymentLinkCreationMeta, title: 'API-connected/Pay by Link/Payment Link Creation' };

export const Default: ElementStory<typeof PaymentLinkCreation, SessionControls> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;

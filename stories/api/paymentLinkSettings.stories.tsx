import { Meta } from '@storybook/preact';
import { PaymentLinkSettings } from '../../src';
import { ElementProps, ElementStory, SessionControls } from '@integration-components/testing/storybook-helpers';
import { PaymentLinkSettingsMeta } from '../components/paymentLinkSettings';
import { EMPTY_SESSION_OBJECT } from '@integration-components/testing/storybook-helpers';

const meta: Meta<ElementProps<typeof PaymentLinkSettings>> = { ...PaymentLinkSettingsMeta, title: 'API-connected/Pay by Link/Payment Link Settings' };

export const Default: ElementStory<typeof PaymentLinkSettings, SessionControls> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;

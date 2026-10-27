import type { Meta } from '@storybook/vue3';
import { paymentLinkSettingsMeta } from './meta';
import type { PaymentLinkSettingsExternalProps } from '../../src';
import { ElementProps, ElementStory, EMPTY_SESSION_OBJECT, SessionControls } from '@integration-components/testing/storybook-helpers';

const meta: Meta<ElementProps<PaymentLinkSettingsExternalProps>> = {
    ...paymentLinkSettingsMeta,
    title: 'API-connected/Pay by Link/Payment Link Settings',
};

export const Default: ElementStory<PaymentLinkSettingsExternalProps, SessionControls> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;

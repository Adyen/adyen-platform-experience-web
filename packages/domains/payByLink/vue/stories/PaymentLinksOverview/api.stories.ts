import type { Meta } from '@storybook/vue3';
import { PaymentLinksOverviewMeta } from './meta';
import type { PaymentLinksOverviewExternalProps } from '../../src';
import { ElementProps, ElementStory, EMPTY_SESSION_OBJECT, SessionControls } from '@integration-components/testing/storybook-helpers';

const meta: Meta<ElementProps<PaymentLinksOverviewExternalProps>> = {
    ...PaymentLinksOverviewMeta,
    title: 'API-connected/Pay by Link/Payment Links Overview',
};

export const Default: ElementStory<PaymentLinksOverviewExternalProps, SessionControls> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;

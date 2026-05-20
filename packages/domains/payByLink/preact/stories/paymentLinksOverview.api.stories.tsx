import { Meta } from '@storybook/preact';
import { PaymentLinksOverview } from '@integration-components/payByLink/publish';
import { ElementProps, ElementStory, SessionControls, EMPTY_SESSION_OBJECT } from '@integration-components/testing/storybook-helpers';
import { PaymentLinksOverviewMeta } from './paymentLinksOverview.meta';

const meta: Meta<ElementProps<typeof PaymentLinksOverview>> = {
    ...PaymentLinksOverviewMeta,
    title: 'API-connected/Pay by Link/Payment Links Overview',
};

export const Default: ElementStory<typeof PaymentLinksOverview, SessionControls> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;

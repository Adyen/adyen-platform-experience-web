import { PaymentLinksOverview } from '../../src';
import { ElementProps, ElementStory, SessionControls } from '../utils/types';
import { Meta } from '@storybook/preact';
import { PaymentLinksOverviewMeta } from '../components/paymentLinksOverview';
import { EMPTY_SESSION_OBJECT } from '../utils/constants';

const meta: Meta<ElementProps<typeof PaymentLinksOverview>> = {
    ...PaymentLinksOverviewMeta,
    title: 'API-connected/Pay By Link/Payment Links Overview',
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

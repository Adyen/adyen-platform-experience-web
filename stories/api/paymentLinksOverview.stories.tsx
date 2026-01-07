import { PaymentLinkOverview } from '../../src';
import { ElementProps, ElementStory, SessionControls } from '../utils/types';
import { Meta } from '@storybook/preact';
import { PaymentLinksOverviewMeta } from '../components/paymentLinksOverview';
import { EMPTY_SESSION_OBJECT } from '../utils/constants';

const meta: Meta<ElementProps<typeof PaymentLinkOverview>> = { ...PaymentLinksOverviewMeta, title: 'API-connected/Payment Links Overview' };

export const Default: ElementStory<typeof PaymentLinkOverview, SessionControls> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;

import { PayoutsOverview } from '../../src';
import { ElementProps, ElementStory, SessionControls } from '../utils/types';
import { EMPTY_SESSION_OBJECT } from '../utils/constants';
import { PayoutsOverviewMeta } from '../components/Payouts/payoutsOverview';
import { Meta } from '@storybook/preact';

const meta: Meta<ElementProps<typeof PayoutsOverview>> = { ...PayoutsOverviewMeta, title: 'API-connected/Payouts/Payouts Overview' };

export const Default: ElementStory<typeof PayoutsOverview, SessionControls> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;

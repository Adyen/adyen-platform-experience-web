import { PayoutsOverview } from '../../src';
import { ElementProps, ElementStory, SessionControls as SessionControl } from '../utils/types';
import { EMPTY_SESSION_OBJECT } from '../utils/constants';
import { PayoutsMeta } from '../components/payoutsOverview';
import { Meta } from '@storybook/preact';

const meta: Meta<ElementProps<typeof PayoutsOverview>> = { ...PayoutsMeta, title: 'Integration/Payouts Overview' };

export const Default: ElementStory<typeof PayoutsOverview, SessionControl> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;

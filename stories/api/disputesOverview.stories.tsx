import { DisputesOverview } from '../../src';
import { ElementProps, ElementStory, SessionControls } from '../utils/types';
import { EMPTY_SESSION_OBJECT } from '../utils/constants';
import { DisputesOverviewMeta } from '../components/disputesOverview';
import { Meta } from '@storybook/preact';

const meta: Meta<ElementProps<typeof DisputesOverview>> = { ...DisputesOverviewMeta, title: 'API-connected/Disputes/Disputes Overview' };

export const Default: ElementStory<typeof DisputesOverview, SessionControls> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;

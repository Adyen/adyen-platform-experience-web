import { ElementProps, ElementStory, SessionControls as SessionControl } from '../utils/types';
import { Meta } from '@storybook/preact';
import { CapitalOverview } from '../../src';
import { CapitalOverviewMeta } from '../components/capitalOverview';
import { EMPTY_SESSION_OBJECT } from '../utils/constants';

const meta: Meta<ElementProps<typeof CapitalOverview>> = { ...CapitalOverviewMeta, title: 'Integration/Capital Overview' };

export const Basic: ElementStory<typeof CapitalOverview, SessionControl> = {
    name: 'Basic',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;

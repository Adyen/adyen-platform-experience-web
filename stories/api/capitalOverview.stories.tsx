import { ElementProps, ElementStory, SessionControls } from '../utils/types';
import { Meta } from '@storybook/preact';
import { CapitalOverview } from '../../src';
import { CapitalOverviewMeta } from '../components/capitalOverview';
import { EMPTY_SESSION_OBJECT } from '../utils/constants';

const meta: Meta<ElementProps<typeof CapitalOverview>> = { ...CapitalOverviewMeta, title: 'API-connected/Capital/Capital Overview' };

export const Default: ElementStory<typeof CapitalOverview, SessionControls> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;

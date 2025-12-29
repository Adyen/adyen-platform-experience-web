import { PayByLinkOverview } from '../../src';
import { ElementProps, ElementStory, SessionControls } from '../utils/types';
import { Meta } from '@storybook/preact';
import { PayByLinkOverviewMeta } from '../components/payByLinkOverview';
import { EMPTY_SESSION_OBJECT } from '../utils/constants';

const meta: Meta<ElementProps<typeof PayByLinkOverview>> = { ...PayByLinkOverviewMeta, title: 'API-connected/Pay By Link Overview' };

export const Default: ElementStory<typeof PayByLinkOverview, SessionControls> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;

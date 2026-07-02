import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory, EMPTY_SESSION_OBJECT, SessionControls } from '@integration-components/testing/storybook-helpers';
import { PayoutsOverview } from '../../src';
import { PayoutsOverviewMeta } from './meta';

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

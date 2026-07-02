import { ElementProps, ElementStory, EMPTY_SESSION_OBJECT, SessionControls } from '@integration-components/testing/storybook-helpers';
import { Meta } from '@storybook/preact';
import { CapitalOverview } from '@integration-components/capital/preact';
import { CapitalOverviewMeta } from './meta';

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

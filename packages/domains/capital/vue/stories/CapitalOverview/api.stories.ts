import { ElementProps, ElementStory, EMPTY_SESSION_OBJECT, SessionControls } from '@integration-components/testing/storybook-helpers';
import type { Meta } from '@storybook/vue3';
import { CapitalOverviewElement } from '../../src/CapitalOverview';
import { CapitalOverviewMeta } from './meta';

const meta: Meta<ElementProps<typeof CapitalOverviewElement>> = { ...CapitalOverviewMeta, title: 'API-connected/Capital/Capital Overview' };

export const Default: ElementStory<typeof CapitalOverviewElement, SessionControls> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;

import type { Meta } from '@storybook/vue3';
import { ElementProps, ElementStory, EMPTY_SESSION_OBJECT, SessionControls } from '@integration-components/testing/storybook-helpers';
import type { DisputesOverviewExternalProps } from '../../src';
import { DisputesOverviewMeta } from './meta';

const meta: Meta<ElementProps<DisputesOverviewExternalProps>> = {
    ...DisputesOverviewMeta,
    title: 'API-connected/Disputes/Disputes Overview',
};

export const Default: ElementStory<DisputesOverviewExternalProps, SessionControls> = {
    name: 'Default',
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;

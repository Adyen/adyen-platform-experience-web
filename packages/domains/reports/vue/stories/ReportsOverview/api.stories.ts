import type { Meta } from '@storybook/vue3';
import { ReportsOverviewMeta } from './meta';
import type { ReportsOverviewExternalProps } from '../../src';
import { ElementProps, ElementStory, EMPTY_SESSION_OBJECT, SessionControls } from '@integration-components/testing/storybook-helpers';

const meta: Meta<ElementProps<ReportsOverviewExternalProps>> = {
    ...ReportsOverviewMeta,
    title: 'API-connected/Reports/Reports Overview',
};

export const Default: ElementStory<ReportsOverviewExternalProps, SessionControls> = {
    name: 'Default',
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;

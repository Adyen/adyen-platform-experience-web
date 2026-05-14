import type { Meta } from '@storybook/vue3';
import { ReportsOverviewMeta } from '../components/reportsOverview';
import { ElementProps, ElementStory, EMPTY_SESSION_OBJECT } from '@integration-components/testing/storybook-helpers';
import ReportsOverview from '../../src/ReportsOverview/ReportsOverviewWrapper.vue';

const meta: Meta<ElementProps<typeof ReportsOverview>> = {
    ...ReportsOverviewMeta,
    title: 'API-connected/Reports/Reports Overview',
};

export default meta;

export const Default: ElementStory<typeof ReportsOverview> = {
    name: 'Default',
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

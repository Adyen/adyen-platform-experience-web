import type { Meta } from '@storybook/vue3';
import { PayoutsOverviewMeta } from '../components/payoutsOverview';
import { ElementProps, ElementStory, EMPTY_SESSION_OBJECT } from '@integration-components/testing/storybook-helpers';
import PayoutsOverview from '../../src/PayoutsOverview/PayoutsOverviewWrapper.vue';

const meta: Meta<ElementProps<typeof PayoutsOverview>> = {
    ...PayoutsOverviewMeta,
    title: 'API-connected/Payouts/Payouts Overview',
};

export default meta;

export const Default: ElementStory<typeof PayoutsOverview> = {
    name: 'Default',
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

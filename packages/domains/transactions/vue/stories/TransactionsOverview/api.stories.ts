import type { Meta } from '@storybook/vue3';
import { TransactionsOverviewMeta } from './meta';
import { ElementProps, ElementStory, EMPTY_SESSION_OBJECT } from '@integration-components/testing/storybook-helpers';
import TransactionsOverview from '../../src/TransactionsOverview/TransactionsOverviewWrapper.vue';

const meta: Meta<ElementProps<typeof TransactionsOverview>> = {
    ...TransactionsOverviewMeta,
    title: 'API-connected/Transactions/Transactions Overview',
};

export const Default: ElementStory<typeof TransactionsOverview> = {
    name: 'Default',
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;

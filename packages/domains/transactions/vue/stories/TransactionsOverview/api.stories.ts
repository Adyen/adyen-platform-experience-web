import type { Meta } from '@storybook/vue3';
import { TransactionsOverviewMeta } from './meta';
import type { TransactionsOverviewExternalProps } from '../../src';
import { ElementProps, ElementStory, EMPTY_SESSION_OBJECT, SessionControls } from '@integration-components/testing/storybook-helpers';

const meta: Meta<ElementProps<TransactionsOverviewExternalProps>> = {
    ...TransactionsOverviewMeta,
    title: 'API-connected/Transactions/Transactions Overview',
};

export const Default: ElementStory<TransactionsOverviewExternalProps, SessionControls> = {
    name: 'Default',
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;

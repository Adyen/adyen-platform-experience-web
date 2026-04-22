import { TransactionsOverview } from '../../src';
import { ElementProps, ElementStory, SessionControls } from '@integration-components/testing/storybook-helpers';
import { EMPTY_SESSION_OBJECT } from '@integration-components/testing/storybook-helpers';
import { TransactionsOverviewMeta } from '../components/transactionsOverview';
import { Meta } from '@storybook/preact';

const meta: Meta<ElementProps<typeof TransactionsOverview>> = {
    ...TransactionsOverviewMeta,
    title: 'API-connected/Transactions/Transactions Overview',
};

export const Default: ElementStory<typeof TransactionsOverview, SessionControls> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;

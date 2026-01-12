import { TransactionsOverview } from '../../src';
import { ElementProps, ElementStory, SessionControls } from '../utils/types';
import { EMPTY_SESSION_OBJECT } from '../utils/constants';
import { TransactionsOverviewMeta } from '../components/Transactions/transactionsOverview';
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

import { TransactionsInsights } from '../../src';
import { ElementProps, ElementStory, SessionControls } from '../utils/types';
import { EMPTY_SESSION_OBJECT } from '../utils/constants';
import { TransactionsInsightsMeta } from '../components/transactionsInsights';
import { Meta } from '@storybook/preact';

const meta: Meta<ElementProps<typeof TransactionsInsights>> = {
    ...TransactionsInsightsMeta,
    title: 'API-connected/Transactions/Transactions Insights',
};

export const Default: ElementStory<typeof TransactionsInsights, SessionControls> = {
    name: 'Default',
    argTypes: {
        session: { control: 'object' },
    },
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};

export default meta;

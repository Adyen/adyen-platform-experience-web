import { TransactionsOverview } from '../../src';
import { ElementProps, ElementStory, SessionControls } from '../utils/types';
import { EMPTY_SESSION_OBJECT } from '../utils/constants';
import { TransactionsMeta } from '../components/transactionsOverview';
import { Meta } from '@storybook/preact';

const meta: Meta<ElementProps<typeof TransactionsOverview>> = { ...TransactionsMeta, title: 'API-connected/Transactions Overview' };

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

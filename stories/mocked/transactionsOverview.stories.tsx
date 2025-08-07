import { TransactionsOverview } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { http, HttpResponse } from 'msw';
import { TransactionsOverviewMeta } from '../components/transactionsOverview';
import { Meta } from '@storybook/preact';
import { endpoints } from '../../endpoints/endpoints';
import { getCustomTransactionDataById, getMyCustomData } from './utils/customDataRequest';
import { TRANSACTIONS } from '../../mocks/mock-data';

const meta: Meta<ElementProps<typeof TransactionsOverview>> = { ...TransactionsOverviewMeta, title: 'Mocked/Transactions Overview' };
export const Default: ElementStory<typeof TransactionsOverview> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};

export default meta;

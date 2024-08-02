import { TransactionsOverview } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { http, HttpResponse } from 'msw';
import { TransactionsMeta } from '../components/transactionList';
import { Meta } from '@storybook/preact';

const meta: Meta<ElementProps<typeof TransactionsOverview>> = { ...TransactionsMeta, title: 'Mocked/Transactions List' };
export const Basic: ElementStory<typeof TransactionsOverview> = {
    name: 'Basic (Mocked)',
    args: {
        mockedApi: true,
    },
};

Basic.parameters = {
    msw: {
        handlers: [
            http.get('https://platform-components-external-test.adyen.com/platform-components-external/api/v1/transactions', () => {
                return HttpResponse.json({
                    data: [
                        {
                            id: '1VVF0D5V3709DX6D',
                            amount: { currency: 'EUR', value: 200000 },
                            balanceAccountId: '',
                            status: 'Booked',
                            category: 'Fee',
                            paymentMethod: { lastFourDigits: '1945', type: 'mc' },
                            createdAt: '2024-07-29T14:47:03+02:00',
                        },
                    ],
                    _links: {},
                });
            }),
        ],
    },
};

export default meta;

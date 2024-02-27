import { rest } from 'msw';
import { BASIC_TRANSACTIONS_LIST, TRANSACTION_DETAILS_DEFAULT } from '../../../../../mocks/src/transactions';
import { endpoints } from '../endpoints';
import { delay } from '../utils/utils';

const mockEndpoints = endpoints('mock');
export const transactionsMocks = [
    rest.get(mockEndpoints.transactions, (req, res, ctx) => {
        const categories = req.url.searchParams.get('categories')?.split(',');
        const currencies = req.url.searchParams.get('currencies')?.split(',');
        const statuses = req.url.searchParams.get('statuses')?.split(',');

        const categoriesFilter = !!(categories && categories.length);
        const currenciesFilter = !!(currencies && currencies.length);
        const statusesFilter = !!(statuses && statuses.length);

        let transactions = BASIC_TRANSACTIONS_LIST;
        let responseDelay = 200;

        if (categoriesFilter || currenciesFilter || statusesFilter) {
            transactions = transactions.filter(
                tx =>
                    (!categoriesFilter || categories!.includes(tx.category)) &&
                    (!currenciesFilter || currencies!.includes(tx.amount.currency)) &&
                    (!statusesFilter || statuses!.includes(tx.status))
            );

            responseDelay = 400;
        }

        return res(delay(responseDelay), ctx.json({ transactions }));
    }),

    rest.get(mockEndpoints.transaction, (req, res, ctx) => {
        const matchingMock = [...BASIC_TRANSACTIONS_LIST, TRANSACTION_DETAILS_DEFAULT].find(mock => mock.id === req.params.id);

        if (!matchingMock) {
            res(ctx.status(404), ctx.text('Cannot find matching Transaction mock'));
            return;
        }
        return res(ctx.json(matchingMock));
    }),
];

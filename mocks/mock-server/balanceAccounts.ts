import { rest } from 'msw';
import { BALANCE_ACCOUNTS, BALANCES } from '../mock-data';
import { endpoints } from '../../endpoints/endpoints';
import { delay } from './utils';

const mockEndpoints = endpoints('mock');
const networkError = false;

export const balanceAccountMock = [
    rest.get(mockEndpoints.balanceAccounts, (req, res, ctx) => {
        if (networkError) {
            return res.networkError('Failed to connect');
        }
        return res(
            delay(200),
            ctx.json({
                data: BALANCE_ACCOUNTS,
            })
        );
    }),
    rest.get(mockEndpoints.balances, (req, res, ctx) => {
        const balanceAccountId = req.params.id as string;
        return res(
            delay(300),
            ctx.json({
                data: BALANCES[balanceAccountId],
            })
        );
    }),
];

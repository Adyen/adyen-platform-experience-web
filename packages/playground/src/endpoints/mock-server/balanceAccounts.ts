import { rest } from 'msw';
import { endpoints } from '../endpoints';
import { delay } from '../utils/utils';
import { BALANCES } from '../../../../mocks/src/balances';
import { BALANCE_ACCOUNTS } from '../../../../mocks';

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
        return res(
            delay(300),
            ctx.json({
                data: BALANCES,
            })
        );
    }),
];

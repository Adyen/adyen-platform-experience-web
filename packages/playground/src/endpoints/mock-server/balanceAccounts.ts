import { rest } from 'msw';
import { endpoints } from '../endpoints';
import { delay } from '../utils/utils';
import { BALANCE_ACCOUNTS_SINGLE } from '@adyen/adyen-platform-experience-web-mocks';
import { BALANCES } from '../../../../mocks/src/balances';

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
                balanceAccounts: BALANCE_ACCOUNTS_SINGLE,
            })
        );
    }),
    rest.get(mockEndpoints.balances, (req, res, ctx) => {
        return res(
            delay(300),
            ctx.json({
                balances: BALANCES,
            })
        );
    }),
];

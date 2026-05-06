import { BALANCE_ACCOUNTS, BALANCE_ACCOUNTS_SINGLE } from '@integration-components/testing/fixtures/balanceAccounts';
import type { IBalance } from '../../src';

export const BALANCES: Record<string, IBalance[]> = {
    [BALANCE_ACCOUNTS[0].id]: [
        {
            value: 350000,
            reservedValue: 17500,
            currency: 'USD',
        },
        {
            value: 21000,
            reservedValue: 3000,
            currency: 'EUR',
        },
    ],
    [BALANCE_ACCOUNTS[1].id]: [
        {
            value: 10750,
            reservedValue: 675,
            currency: 'USD',
        },
        {
            value: 204825,
            reservedValue: 20550,
            currency: 'EUR',
        },
    ],
    [BALANCE_ACCOUNTS[2].id]: [
        {
            value: 5250,
            reservedValue: 0,
            currency: 'USD',
        },
    ],
};

export { BALANCE_ACCOUNTS, BALANCE_ACCOUNTS_SINGLE };

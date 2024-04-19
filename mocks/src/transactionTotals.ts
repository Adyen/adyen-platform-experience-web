import { ITransactionTotal } from '@adyen/adyen-platform-experience-web';

export const TRANSACTION_TOTALS: ITransactionTotal[] = [
    {
        currency: 'EUR',
        incomings: 2892,
        expenses: -23484,
    },
    {
        currency: 'USD',
        incomings: 200000000000,
        expenses: -100000000000,
    },
    {
        currency: 'BRL',
        incomings: 20000,
        expenses: -1000,
    },
];

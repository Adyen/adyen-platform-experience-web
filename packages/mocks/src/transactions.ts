import type { ITransaction } from '@adyen/adyen-platform-experience-web/src';

export const TRANSACTIONS: ITransaction[] = [
    {
        id: '1WEPGD5VS767881Q',
        amount: { currency: 'EUR', value: 12000 },
        balanceAccountId: '',
        status: 'Reversed',
        category: 'Payment',
        paymentMethod: { type: 'paypal' },
        creationDate: '2022-08-29T14:47:03+02:00',
    },
    {
        id: '3KVM0J5V771942G',
        amount: { currency: 'EUR', value: 950200 },
        balanceAccountId: '',
        status: 'Reversed',
        category: 'Refund',
        bankAccount: {
            accountNumberLastFourDigits: '1100',
        },
        creationDate: '2022-09-29T14:47:03+02:00',
    },
    {
        id: '1WEPGE5W23KIX9U5',
        amount: { currency: 'USD', value: -4000 },
        balanceAccountId: '',
        status: 'Booked',
        category: 'Fee',
        paymentMethod: { type: 'klarna' },
        creationDate: '2022-08-29T14:47:03+02:00',
    },
    {
        id: '1WEPGE5W2I3OPAQ6',
        amount: { currency: 'EUR', value: 45000 },
        balanceAccountId: '',
        status: 'Reversed',
        category: 'Capital',
        paymentMethod: { lastFourDigits: '2894', type: 'visa' },
        creationDate: '2022-08-29T14:47:03+02:00',
    },
    {
        id: '1VVF0E5W838BKHRK',
        amount: { currency: 'EUR', value: 690500 },
        balanceAccountId: '',
        status: 'Booked',
        category: 'Transfer',
        creationDate: '2022-08-29T14:47:03+02:00',
    },
    {
        id: '1WEPGE5W838BO42V',
        amount: { currency: 'EUR', value: 85050 },
        balanceAccountId: '',
        status: 'Booked',
        category: 'Capital',
        paymentMethod: { type: 'klarna' },
        creationDate: '2022-08-29T14:47:03+02:00',
    },
    {
        id: '1WEPGE5W838BO47L',
        amount: { currency: 'EUR', value: 3000 },
        balanceAccountId: '',
        status: 'Pending',
        category: 'Capital',
        paymentMethod: { lastFourDigits: '9471', type: 'amex' },
        creationDate: '2022-08-29T14:47:03+02:00',
    },
    {
        id: '1VVF0D5V370945D',
        amount: { currency: 'EUR', value: 820000 },
        balanceAccountId: '',
        status: 'Booked',
        category: 'Correction',
        bankAccount: {
            accountNumberLastFourDigits: '2975',
        },
        creationDate: '2022-08-29T14:47:03+02:00',
    },
    {
        id: '1WEPGE5W23KIX9T7',
        amount: { currency: 'EUR', value: 55000 },
        balanceAccountId: '',
        status: 'Booked',
        category: 'Capital',
        paymentMethod: { lastFourDigits: '1011', type: 'visa' },
        creationDate: '2022-08-29T14:47:03+02:00',
    },
];

export const DEFAULT_TRANSACTION: ITransaction = {
    id: '1VVF0D5V3709DX6D',
    amount: { currency: 'USD', value: 100000 },
    balanceAccountId: '',
    status: 'Booked',
    category: 'Fee',
    paymentMethod: { lastFourDigits: '1945', type: 'mc' },
    creationDate: '2022-08-29T14:47:03+02:00',
};

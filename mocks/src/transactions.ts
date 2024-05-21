import { ITransaction } from '../../packages/lib/src/types';

const TRANSACTION_DETAILS_1: ITransaction = {
    balanceAccountId: '',
    id: '1WEPGD5VS767881Q',
    amount: { currency: 'EUR', value: 12000 },
    status: 'Reversed',
    category: 'Payment',
    paymentMethod: { type: 'paypal' },
    createdAt: '2022-08-29T14:47:03+02:00',
};
const TRANSACTION_DETAILS_2: ITransaction = {
    balanceAccountId: '',
    id: '3KVM0J5V771942G',
    amount: { currency: 'EUR', value: 950200 },
    status: 'Reversed',
    category: 'Refund',
    bankAccount: {
        accountNumberLastFourDigits: '1100',
    },
    createdAt: '2022-09-29T14:47:03+02:00',
};
const TRANSACTION_DETAILS_3: ITransaction = {
    balanceAccountId: '',
    id: '1WEPGE5W23KIX9U5',
    amount: { currency: 'USD', value: -4000 },
    status: 'Booked',
    category: 'Fee',
    paymentMethod: { type: 'klarna' },
    createdAt: '2022-08-29T14:47:03+02:00',
};
const TRANSACTION_DETAILS_4: ITransaction = {
    balanceAccountId: '',
    id: '1WEPGE5W2I3OPAQ6',
    amount: { currency: 'EUR', value: 45000 },
    status: 'Reversed',
    category: 'Capital',
    paymentMethod: { lastFourDigits: '2894', type: 'visa' },
    createdAt: '2022-08-29T14:47:03+02:00',
};
const TRANSACTION_DETAILS_5: ITransaction = {
    balanceAccountId: '',
    id: '1VVF0E5W838BKHRK',
    amount: { currency: 'EUR', value: 690500 },
    status: 'Booked',
    category: 'Transfer',
    createdAt: '2022-08-29T14:47:03+02:00',
};
const TRANSACTION_DETAILS_6: ITransaction = {
    balanceAccountId: '',
    id: '1WEPGE5W838BO42V',
    amount: { currency: 'EUR', value: 85050 },
    status: 'Booked',
    category: 'Capital',
    paymentMethod: { type: 'klarna' },
    createdAt: '2022-08-29T14:47:03+02:00',
};
const TRANSACTION_DETAILS_7: ITransaction = {
    balanceAccountId: '',
    id: '1WEPGE5W838BO47L',
    amount: { currency: 'EUR', value: 3000 },
    status: 'Pending',
    category: 'Capital',
    paymentMethod: { lastFourDigits: '9471', type: 'amex' },
    createdAt: '2022-08-29T14:47:03+02:00',
};
const TRANSACTION_DETAILS_8: ITransaction = {
    balanceAccountId: '',
    id: '1VVF0D5V370945D',
    amount: { currency: 'EUR', value: 820000 },
    status: 'Booked',
    category: 'Correction',
    bankAccount: {
        accountNumberLastFourDigits: '2975',
    },
    createdAt: '2022-08-29T14:47:03+02:00',
};
const TRANSACTION_DETAILS_9: ITransaction = {
    balanceAccountId: '',
    id: '1WEPGE5W23KIX9T7',
    amount: { currency: 'EUR', value: 55000 },
    status: 'Booked',
    category: 'Capital',
    paymentMethod: { lastFourDigits: '1011', type: 'visa' },
    createdAt: '2022-08-29T14:47:03+02:00',
};

export const TRANSACTION_DETAILS_DEFAULT: ITransaction = {
    balanceAccountId: '',
    id: '1VVF0D5V3709DX6D',
    amount: { currency: 'USD', value: 100000 },
    status: 'Booked',
    category: 'Fee',
    paymentMethod: { lastFourDigits: '1945', type: 'mc' },
    createdAt: '2022-08-29T14:47:03+02:00',
};

export const BASIC_TRANSACTIONS_LIST = [
    TRANSACTION_DETAILS_1,
    TRANSACTION_DETAILS_2,
    TRANSACTION_DETAILS_3,
    TRANSACTION_DETAILS_3,
    TRANSACTION_DETAILS_3,
    TRANSACTION_DETAILS_3,
    TRANSACTION_DETAILS_3,
    TRANSACTION_DETAILS_3,
    TRANSACTION_DETAILS_3,
    TRANSACTION_DETAILS_3,
    TRANSACTION_DETAILS_3,
    TRANSACTION_DETAILS_3,
    TRANSACTION_DETAILS_3,
    TRANSACTION_DETAILS_3,
    TRANSACTION_DETAILS_3,
    TRANSACTION_DETAILS_3,
    TRANSACTION_DETAILS_3,
    TRANSACTION_DETAILS_3,
    TRANSACTION_DETAILS_3,
    TRANSACTION_DETAILS_3,
    TRANSACTION_DETAILS_3,
    TRANSACTION_DETAILS_4,
    TRANSACTION_DETAILS_5,
    TRANSACTION_DETAILS_6,
    TRANSACTION_DETAILS_7,
    TRANSACTION_DETAILS_8,
    TRANSACTION_DETAILS_9,
];

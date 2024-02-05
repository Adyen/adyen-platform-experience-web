import type { ITransaction } from '@adyen/adyen-fp-web/src/types/models/api/transactions';

const TRANSACTION_DETAILS_1: ITransaction = {
    id: '1WEPGD5VS767881Q',
    amount: { currency: 'EUR', value: 12000 },
    status: 'Rejected',
    category: 'Payment',
    paymentMethod: { lastFourDigits: 6655, type: 'paypal' },
    creationDate: '2022-08-29T14:47:03+02:00',
};
const TRANSACTION_DETAILS_2: ITransaction = {
    id: '1WEPGE5W23KIX9T7',
    amount: { currency: 'EUR', value: 55000 },
    status: 'Booked',
    category: 'Capital',
    paymentMethod: { lastFourDigits: 1011, type: 'visa' },
    creationDate: '2022-08-29T14:47:03+02:00',
};
const TRANSACTION_DETAILS_3: ITransaction = {
    id: '1WEPGE5W23KIX9U5',
    amount: { currency: 'USD', value: 4000 },
    status: 'Booked',
    category: 'Chargeback',
    paymentMethod: { lastFourDigits: 8091, type: 'klarna' },
    creationDate: '2022-08-29T14:47:03+02:00',
};
const TRANSACTION_DETAILS_4: ITransaction = {
    id: '1WEPGE5W2I3OPAQ6',
    amount: { currency: 'EUR', value: 45000 },
    status: 'Rejected',
    category: 'Capital',
    paymentMethod: { lastFourDigits: 2894, type: 'visa' },
    creationDate: '2022-08-29T14:47:03+02:00',
};
const TRANSACTION_DETAILS_5: ITransaction = {
    id: '1VVF0E5W838BKHRK',
    amount: { currency: 'EUR', value: 690500 },
    status: 'Booked',
    category: 'Transfer',
    paymentMethod: { lastFourDigits: 1209, type: 'mc' },
    creationDate: '2022-08-29T14:47:03+02:00',
};
const TRANSACTION_DETAILS_6: ITransaction = {
    id: '1WEPGE5W838BO42V',
    amount: { currency: 'EUR', value: 85050 },
    status: 'Booked',
    category: 'Capital',
    paymentMethod: { lastFourDigits: 6332, type: 'klarna' },
    creationDate: '2022-08-29T14:47:03+02:00',
};
const TRANSACTION_DETAILS_7: ITransaction = {
    id: '1WEPGE5W838BO47L',
    amount: { currency: 'EUR', value: 3000 },
    status: 'Pending',
    category: 'Capital',
    paymentMethod: { lastFourDigits: 9471, type: 'amex' },
    creationDate: '2022-08-29T14:47:03+02:00',
};
const TRANSACTION_DETAILS_8: ITransaction = {
    id: '1VVF0D5V370945D',
    amount: { currency: 'EUR', value: 820000 },
    status: 'Booked',
    category: 'Correction',
    paymentMethod: { lastFourDigits: 4312, type: 'klarna' },
    creationDate: '2022-08-29T14:47:03+02:00',
};

export const TRANSACTION_DETAILS_DEFAULT: ITransaction = {
    id: '1VVF0D5V3709DX6D',
    amount: { currency: 'USD', value: 100000 },
    status: 'Booked',
    category: 'Fee',
    paymentMethod: { lastFourDigits: 1945, type: 'mc' },
    creationDate: '2022-08-29T14:47:03+02:00',
};

export const BASIC_TRANSACTIONS_LIST = [
    TRANSACTION_DETAILS_1,
    TRANSACTION_DETAILS_2,
    TRANSACTION_DETAILS_3,
    TRANSACTION_DETAILS_4,
    TRANSACTION_DETAILS_5,
    TRANSACTION_DETAILS_6,
    TRANSACTION_DETAILS_7,
    TRANSACTION_DETAILS_8,
];

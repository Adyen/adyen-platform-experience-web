import { ACCOUNT_HOLDER_1, ACCOUNT_HOLDER_2 } from './accountHolders';
import { BALANCE_ACCOUNT_DETAILS_1, BALANCE_ACCOUNT_DETAILS_2, BALANCE_ACCOUNT_DETAILS_3, BALANCE_ACCOUNT_DETAILS_4 } from './balanceAccounts';
import type { ITransaction } from '@adyen/adyen-fp-web/src/types/models/api/transactions';

const TRANSACTION_DETAILS_1: ITransaction = {
    balancePlatform: 'TestBalancePlatform',
    description: 'Description',
    id: '1WEPGD5VS767881Q',
    accountHolderId: ACCOUNT_HOLDER_1.id,
    amount: { currency: 'EUR', value: -10 },
    balanceAccountId: BALANCE_ACCOUNT_DETAILS_1.id,
    bookingDate: '2022-08-04T16:10:22+02:00',
    category: 'internal',
    createdAt: '2022-08-04T16:10:22+02:00',
    instructedAmount: { currency: 'EUR', value: -10 },
    reference: 'f9593f29-7c2b-3226-9b67-7dc2fef7f71c-f2495a90-afdd-35f7-ad4b-61a8596290ad',
    status: 'booked',
    transferId: '1WEPGD5VS767880S',
    type: 'fee',
    valueDate: '2022-08-04T16:10:22+02:00',
    referenceForBeneficiary: 'ac43b566-2a02-11ee-be56-0242ac120002',
    counterparty: {
        balanceAccountId: 'BA00000000000000000000001',
    },
};
const TRANSACTION_DETAILS_2: ITransaction = {
    balancePlatform: 'TestBalancePlatform',
    id: '1WEPGE5W23KIX9T7',
    description: 'Description',
    accountHolderId: ACCOUNT_HOLDER_2.id,
    amount: { currency: 'EUR', value: 600000 },
    balanceAccountId: BALANCE_ACCOUNT_DETAILS_2.id,
    bookingDate: '2022-08-29T14:47:03+02:00',
    category: 'platformPayment',
    createdAt: '2022-08-29T14:47:03+02:00',
    instructedAmount: { currency: 'EUR', value: 600000 },
    reference: '14d5a278-e73c-375e-8d5a-6d6f5ad7277e-e3d7720c-2c23-36ed-a368-0160c7630554',
    referenceForBeneficiary: 'Shane_Erika_Payment',
    status: 'booked',
    transferId: '1VVF0E5W23KILIGL',
    type: 'capture',
    valueDate: '2022-08-29T14:47:03+02:00',
    counterparty: {
        balanceAccountId: 'BA00000000000000000000001',
    },
};
const TRANSACTION_DETAILS_3: ITransaction = {
    balancePlatform: 'TestBalancePlatform',
    id: '1WEPGE5W23KIX9U5',
    description: 'Description',
    accountHolderId: ACCOUNT_HOLDER_1.id,
    amount: { currency: 'EUR', value: 20000 },
    balanceAccountId: BALANCE_ACCOUNT_DETAILS_3.id,
    bookingDate: '2022-08-29T14:47:03+02:00',
    category: 'platformPayment',
    createdAt: '2022-08-29T14:47:03+02:00',
    instructedAmount: { currency: 'EUR', value: 20000 },
    reference: '14d5a278-e73c-375e-8d5a-6d6f5ad7277e-f0f13e29-990f-30ea-b25f-047e9a68614a',
    referenceForBeneficiary: 'Shane_Liable_Account_Holder',
    status: 'booked',
    transferId: '1VVF0E5W23KIT89R',
    type: 'capture',
    valueDate: '2022-08-29T14:47:03+02:00',
    counterparty: {
        balanceAccountId: 'BA00000000000000000000001',
    },
};
const TRANSACTION_DETAILS_4: ITransaction = {
    balancePlatform: 'TestBalancePlatform',
    id: '1WEPGE5W2I3OPAQ6',
    accountHolderId: ACCOUNT_HOLDER_2.id,
    description: 'Description',
    amount: { currency: 'EUR', value: -20 },
    balanceAccountId: BALANCE_ACCOUNT_DETAILS_4.id,
    bookingDate: '2022-08-30T15:11:35+02:00',
    category: 'internal',
    createdAt: '2022-08-30T15:11:35+02:00',
    instructedAmount: { currency: 'EUR', value: -20 },
    reference: 'b6128960-e6b5-31ff-8ea2-e74f38b88346-7454dd51-538c-3e5b-b0d0-c20aa86d1f8f',
    status: 'booked',
    transferId: '1VVF0E5W2I3OL7Z5',
    type: 'fee',
    valueDate: '2022-08-30T15:11:35+02:00',
    referenceForBeneficiary: 'ac43b566-2a02-11ee-be56-ee0b3898',
    counterparty: {
        balanceAccountId: 'BA00000000000000000000001',
    },
};
const TRANSACTION_DETAILS_5: ITransaction = {
    balancePlatform: 'TestBalancePlatform',
    id: '1VVF0E5W838BKHRK',
    accountHolderId: ACCOUNT_HOLDER_1.id,
    amount: { currency: 'EUR', value: 2190 },
    balanceAccountId: BALANCE_ACCOUNT_DETAILS_1.id,
    bookingDate: '2022-09-13T17:00:44+02:00',
    category: 'platformPayment',
    createdAt: '2022-09-13T17:00:43+02:00',
    description: '',
    instructedAmount: { currency: 'EUR', value: 2190 },
    reference: 'e654fad1-6247-3e07-af20-cabf96d61ad7-ad4a8845-8bc7-374a-98ea-091fb3d55b48',
    status: 'booked',
    transferId: '1VVF0E5W838BKHQM',
    type: 'capture',
    valueDate: '2022-09-13T17:00:44+02:00',
    referenceForBeneficiary: 'ac43b566-2a02-11ee-be56-0242ac120002',
    counterparty: {
        balanceAccountId: 'BA00000000000000000000001',
    },
};
const TRANSACTION_DETAILS_6: ITransaction = {
    balancePlatform: 'TestBalancePlatform',
    id: '1WEPGE5W838BO42V',
    description: '',
    accountHolderId: ACCOUNT_HOLDER_2.id,
    amount: { currency: 'EUR', value: -30 },
    balanceAccountId: BALANCE_ACCOUNT_DETAILS_2.id,
    bookingDate: '2022-09-13T17:00:43+02:00',
    category: 'internal',
    createdAt: '2022-09-13T17:00:43+02:00',
    instructedAmount: { currency: 'EUR', value: -30 },
    reference: 'd1ca2cc8-1d76-3197-afee-a1d4f42348fa-efa1a82d-3556-37a7-9538-28acd3bf3dd5',
    status: 'booked',
    transferId: '1VVF0E5W838BKHOQ',
    type: 'fee',
    valueDate: '2022-09-13T17:00:43+02:00',
    referenceForBeneficiary: 'ac43b566-2a02-11ee-be56-c7f52a88',
    counterparty: {
        balanceAccountId: 'BA00000000000000000000001',
    },
};
const TRANSACTION_DETAILS_7: ITransaction = {
    balancePlatform: 'TestBalancePlatform',
    id: '1WEPGE5W838BO47L',
    accountHolderId: ACCOUNT_HOLDER_1.id,
    amount: { currency: 'EUR', value: 2231 },
    balanceAccountId: BALANCE_ACCOUNT_DETAILS_3.id,
    bookingDate: '2022-09-13T17:00:44+02:00',
    category: 'platformPayment',
    createdAt: '2022-09-13T17:00:43+02:00',
    description: '',
    instructedAmount: { currency: 'EUR', value: 2231 },
    reference: 'c4ca3931-87f4-3c2d-92b1-9d9d79340c10-34dbb119-afbc-326e-8d70-3a6fca3874fc',
    status: 'booked',
    transferId: '1WEPGE5W838BO46N',
    type: 'capture',
    valueDate: '2022-09-13T17:00:44+02:00',
    referenceForBeneficiary: 'ac43b566-2a02-11ee-be56-c7f52bdc',
    counterparty: {
        balanceAccountId: 'BA00000000000000000000001',
    },
};
const TRANSACTION_DETAILS_8: ITransaction = {
    balancePlatform: 'TestBalancePlatform',
    id: '1VVF0D5V370945D',
    description: '',
    accountHolderId: ACCOUNT_HOLDER_2.id,
    amount: { currency: 'EUR', value: -9 },
    balanceAccountId: BALANCE_ACCOUNT_DETAILS_4.id,
    bookingDate: '2022-06-02T16:14:28+02:00',
    category: 'internal',
    createdAt: '2022-06-02T16:14:28+02:00',
    instructedAmount: { currency: 'EUR', value: -9 },
    reference: 'c6fbb3ac-3372-3c40-8012-1a92ed4ccb10-e7274c7a-f8b2-3fdb-a1e5-11f24deb7443',
    status: 'booked',
    transferId: '1VVF0D5V3709DX5F',
    type: 'fee',
    valueDate: '2022-06-02T16:14:28+02:00',
    referenceForBeneficiary: 'ac43b566-2a02-11ee-be56-11ee-be56',
    counterparty: {
        balanceAccountId: 'BA00000000000000000000001',
    },
};
export const TRANSACTION_DETAILS_DEFAULT: ITransaction = {
    balancePlatform: 'TestBalancePlatform',
    id: '1VVF0D5V3709DX6D',
    description: '',
    accountHolderId: 'AH3227B2248HKJ5BHTQPKC5GX',
    amount: { currency: 'EUR', value: -9 },
    balanceAccountId: BALANCE_ACCOUNT_DETAILS_1.id,
    bookingDate: '2022-06-02T16:14:28+02:00',
    category: 'internal',
    createdAt: '2022-06-02T16:14:28+02:00',
    instructedAmount: { currency: 'EUR', value: -9 },
    reference: 'c6fbb3ac-3372-3c40-8012-1a92ed4ccb10-e7274c7a-f8b2-3fdb-a1e5-11f24deb7443',
    status: 'booked',
    transferId: '1VVF0D5V3709DX5F',
    type: 'fee',
    valueDate: '2022-06-02T16:14:28+02:00',
    referenceForBeneficiary: 'c7f530e6-2a02-11ee-be56-2a02-11ee',
    counterparty: {
        balanceAccountId: 'BA00000000000000000000001',
    },
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

import { CurrencyCode } from '../../../utils/constants/currency-codes';
import { StatusType } from '../status';

type TransactionType = 'fee' | 'capture' | 'leftover' | 'manualCorrection' | 'internalTransfer' | 'balanceAdjustment';
export interface ITransaction {
    accountHolderId: string;
    amount: {
        currency: CurrencyCode;
        value: number;
    };
    balanceAccountId: string;
    balancePlatform: string;
    bookingDate: string;
    category: string;
    counterparty: {
        balanceAccountId: string;
    };
    createdAt: string;
    description: string;
    id: string;
    instructedAmount: {
        currency: CurrencyCode;
        value: number;
    };
    reference: string;
    referenceForBeneficiary: string;
    status: StatusType;
    transferId: string;
    type: TransactionType;
    valueDate: string;
}

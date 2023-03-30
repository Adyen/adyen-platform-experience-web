import { CurrencyCode } from '../../utils/constants/currency-codes';

export interface TransactionDetailsProps {
    transaction: {
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
        status: string;
        transferId: string;
        type: string;
        valueDate: string;
    };
}

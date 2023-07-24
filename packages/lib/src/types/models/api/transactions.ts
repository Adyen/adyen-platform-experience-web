import { CurrencyCode } from '../../../utils/constants/currency-codes';
import { BankAccount } from '../bankAccount';
import { IMerchant } from '../merchant';

type TransactionType =
    | 'payment'
    | 'capture'
    | 'captureReversal'
    | 'refund'
    | 'refundReversal'
    | 'chargeback'
    | 'chargebackReversal'
    | 'secondChargeback'
    | 'atmWithdrawal'
    | 'atmWithdrawalReversal'
    | 'internalTransfer'
    | 'manualCorrection'
    | 'invoiceDeduction'
    | 'depositCorrection'
    | 'bankTransfer'
    | 'miscCost'
    | 'paymentCost'
    | 'fee';

type Category = 'platformPayment' | 'internal' | 'bank' | 'issuedCard';
interface InstructedAmount {
    currency: CurrencyCode;
    value: number;
}
export interface ITransaction {
    accountHolderId: string;
    amount: {
        currency: CurrencyCode;
        value: number;
    };
    balanceAccountId: string;
    balancePlatform: string;
    bookingDate: string;
    category: Category;
    counterparty: {
        balanceAccountId: string;
        bankAccount?: BankAccount;
        merchant?: IMerchant;
        transferInstrumentId?: string;
    };
    createdAt: string;
    description: string;
    id: string;
    instructedAmount: InstructedAmount;
    paymentInstrumentId?: string;
    reference: string;
    referenceForBeneficiary: string;
    status: 'pending' | 'booked';
    transferId: string;
    type: TransactionType;
    valueDate: string;
}

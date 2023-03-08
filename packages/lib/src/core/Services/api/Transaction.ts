export type TransactionCategory = 'bank' | 'internal' | 'issueCard' | 'platformPayment';

export type TransactionType =
    | 'atmWithdrawal'
    | 'atmWithdrawalReversal'
    | 'bankTransfer'
    | 'capture'
    | 'captureReversal'
    | 'chargeback'
    | 'chargebackReversal'
    | 'depositCorrection'
    | 'fee'
    | 'internalTransfer'
    | 'invoiceDeduction'
    | 'manualCorrection'
    | 'miscCost'
    | 'payment'
    | 'paymentCost'
    | 'refund'
    | 'refundReversal'
    | 'secondChargeback';

export const enum TransactionStatus {
    BOOKED = 'booked',
    PENDING = 'pending',
}

export interface Amount {
    currency: string;
    value: number;
}

interface Transaction {
    accountHolderId: string;
    amount: Amount;
    balanceAccountId: string;
    balancePlatform: string;
    bookingDate: string;
    category: TransactionCategory;
    counterparty?: object;
    createdAt: string;
    description?: string;
    id: string;
    instructedAmount: Amount;
    paymentInstrumentId?: string,
    reference: string;
    referenceForBeneficiary?: string;
    status: TransactionStatus;
    transferId: string;
    type: TransactionType;
    valueDate: string;
}

type PaginationSequencePage = { href: string };

export interface PaginatedResponse<T> {
    _links?: {
        next?: PaginationSequencePage;
        prev?: PaginationSequencePage;
    };
    data: T[];
}

export type TransactionDetailsResponseDTO = Transaction;
export type TransactionsResponseDTO = PaginatedResponse<Transaction>;

import { Schema } from '../utils';
import { components } from '../resources/TransactionsResource';

export type ICategory = ITransaction['category'];
export type ILineItem = TransactionLineItem;
export type ILineItemRefundStatus = TransactionLineItem['refundStatuses'];
export type IRefundMode = Schema<components, 'RefundMode'>;
export type IRefundReason = Schema<components, 'RefundReason'>;
export type IRefundStatus = Schema<components, 'RefundStatus'>;
export type ITransaction = Schema<components, 'SingleTransaction'>;
export type ITransactionTotal = Schema<components, 'TransactionTotal'>;
export type ITransactionWithDetails = Schema<components, 'SingleTransaction'>;
export type ITransactionRefundPayload = Schema<components, 'RefundRequest'>;
export type ITransactionRefundResponse = Schema<components, 'RefundResponse'>;
export type ITransactionRefundDetails = Schema<components, 'RefundDetails'>;
export type ITransactionRefundStatus = ITransactionRefundDetails['refundStatuses'];
export type IPaymentMethod = Schema<components, 'PaymentMethod'>;
export type IBankAccount = Schema<components, 'BankAccount'>;
export type IAmount = Schema<components, 'Amount'>;

type TransactionLineItemRefundStatus = {
    quantity: number;
    status: IRefundStatus;
};

type TransactionLineItem = {
    amountIncludingTax: IAmount;
    availableQuantity: number;
    description: string;
    id: string;
    originalQuantity: number;
    reference: string;
    refundStatuses: TransactionLineItemRefundStatus[];
    sku?: string;
};

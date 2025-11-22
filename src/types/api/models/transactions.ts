import { Schema } from '../utils';
import { components } from '../resources/TransactionsResource';

export type ICategory = ITransaction['category'];
export type ILineItem = TransactionLineItem;
export type ILineItemRefundStatus = TransactionLineItem['refundStatuses'];
export type IRefundMode = Schema<components, 'RefundMode'>;
export type IRefundReason = Schema<components, 'RefundReason'>;
export type IRefundStatus = Schema<components, 'RefundStatus'>;
export type ITransaction = Schema<components, 'SingleTransaction'>;
export type ITransactionColumn = Schema<components, 'Column'>;
export type ITransactionTotal = Schema<components, 'TransactionTotal'>;
export type ITransactionWithDetails = Schema<components, 'SingleTransaction'>;
export type ITransactionRefundPayload = Schema<components, 'RefundRequest'>;
export type ITransactionRefundResponse = Schema<components, 'RefundResponse'>;
export type ITransactionRefundDetails = Schema<components, 'RefundDetails'>;
export type ITransactionRefundStatus = ITransactionRefundDetails['refundStatuses'];
export type IPaymentMethod = components['schemas']['PaymentMethod'];
export type IBankAccount = components['schemas']['BankAccount'];
export type IAmount = components['schemas']['Amount'];

type TransactionLineItemRefundStatus = {
    quantity: number;
    status: components['schemas']['RefundStatus'];
};

type TransactionLineItem = {
    amountIncludingTax: components['schemas']['Amount'];
    availableQuantity: number;
    description: string;
    id: string;
    originalQuantity: number;
    reference: string;
    refundStatuses: TransactionLineItemRefundStatus[];
    sku?: string;
};

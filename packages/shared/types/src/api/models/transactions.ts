import { Schema } from '../utils';
import { components as v1Components } from '../resources/TransactionsResourceV1';
import { components as v2Components } from '../resources/TransactionsResourceV2';

export type ITransactionCategory = Schema<v2Components, 'Category'>;
export type ITransactionStatus = Schema<v2Components, 'Status'>;
export type ILineItem = TransactionLineItem;
export type ILineItemRefundStatus = TransactionLineItem['refundStatuses'];
export type IRefundMode = Schema<v2Components, 'RefundMode'>;
export type IRefundReason = Schema<v2Components, 'RefundReason'>;
export type IRefundStatus = Schema<v2Components, 'RefundStatus'>;
export type ITransaction = Schema<v2Components, 'TransactionsListItem'>;
export type ITransactionExportColumn = Schema<v1Components, 'ExportColumn'>;
export type ITransactionTotal = Schema<v2Components, 'TransactionTotal'>;
export type ITransactionWithDetails = Schema<v2Components, 'SingleTransaction'>;
export type ITransactionRefundPayload = Schema<v1Components, 'RefundRequest'>;
export type ITransactionRefundResponse = Schema<v1Components, 'RefundResponse'>;
export type ITransactionRefundDetails = Schema<v2Components, 'RefundDetails'>;
export type ITransactionRefundStatus = ITransactionRefundDetails['refundStatuses'];
export type IPaymentMethod = Schema<v2Components, 'PaymentMethod'>;
export type IBankAccount = Schema<v2Components, 'BankAccount'>;
export type IAmount = Schema<v2Components, 'Amount'>;

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

import { Schema } from '../utils';
import { components } from '../resources/TransactionsResource';
import { components as componentsV2 } from '../resources/TransactionsResourceV2';

export type ITransactionCategory = Schema<componentsV2, 'Category'>;
export type ITransactionStatus = Schema<componentsV2, 'Status'>;
export type ILineItem = TransactionLineItem;
export type ILineItemRefundStatus = TransactionLineItem['refundStatuses'];
export type IRefundMode = Schema<componentsV2, 'RefundMode'>;
export type IRefundReason = Schema<componentsV2, 'RefundReason'>;
export type IRefundStatus = Schema<componentsV2, 'RefundStatus'>;
export type ITransaction = Schema<componentsV2, 'TransactionsListItem'>;
export type ITransactionExportColumn = Schema<components, 'ExportColumn'>;
export type ITransactionTotal = Schema<componentsV2, 'TransactionTotal'>;
export type ITransactionWithDetails = Schema<componentsV2, 'SingleTransaction'>;
export type ITransactionRefundPayload = Schema<components, 'RefundRequest'>;
export type ITransactionRefundResponse = Schema<components, 'RefundResponse'>;
export type ITransactionRefundDetails = Schema<componentsV2, 'RefundDetails'>;
export type ITransactionRefundStatus = ITransactionRefundDetails['refundStatuses'];
export type IPaymentMethod = Schema<componentsV2, 'PaymentMethod'>;
export type IBankAccount = Schema<componentsV2, 'BankAccount'>;
export type IAmount = Schema<componentsV2, 'Amount'>;

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

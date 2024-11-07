import { Schema } from '../utils';
import { components } from '../resources/TransactionsResource';

export type ICategory = ITransaction['category'];
export type ILineItem = ITransactionWithDetails['lineItems'][number];
export type ILineItemRefundStatus = ILineItem['refundStatuses'][number];
export type IRefundMode = Schema<components, 'RefundMode'>;
export type IRefundStatus = Schema<components, 'RefundStatus'>;
export type ITransaction = Schema<components, 'SingleTransaction'>;
export type ITransactionTotal = Schema<components, 'TransactionTotal'>;
export type ITransactionWithDetails = Schema<components, 'TransactionResponse'>;
export type ITransactionRefundPayload = Schema<components, 'TransactionRefundRequest'>;
export type ITransactionRefundResponse = Schema<components, 'TransactionRefundResponse'>;
export type ITransactionRefundStatus = ITransactionWithDetails['refundDetails']['refundStatuses'][number];

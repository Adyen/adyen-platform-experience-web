import { Schema } from './api/utils';
import { components } from './openapi/TransactionsResource';

export type ITransaction = Schema<components, 'SingleTransaction'>;

export type ITransactionTotal = Schema<components, 'TransactionTotal'>;

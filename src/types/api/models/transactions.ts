import { Schema } from '../utils';
import { components } from '../resources/TransactionsResource';

export interface ITransaction extends Schema<components, 'SingleTransaction'> {}

export type ICategory = ITransaction['category'];
export type ITransactionTotal = Schema<components, 'TransactionTotal'>;
export type ITransactionWithDetails = Schema<components, 'TransactionResponse'>;

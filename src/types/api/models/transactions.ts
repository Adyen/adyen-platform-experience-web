import { Schema } from '../utils';
import { components } from '../resources/TransactionsResource';

export type ITransaction = Schema<components, 'SingleTransaction'>;

export type ICategory = ITransaction['category'];

export type ITransactionTotal = Schema<components, 'TransactionTotal'>;

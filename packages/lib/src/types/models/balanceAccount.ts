import { Schema } from './api/utils';
import { components } from './openapi/BalanceAccountsResource';

export type IBalanceAccountBase = Schema<components, 'BalanceAccountBase'>;
export type IBalance = Schema<components, 'Balance'>;

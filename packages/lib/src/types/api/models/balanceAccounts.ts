import { Schema } from '../utils';
import { components } from '../resources/BalanceAccountsResource';

export type IBalanceAccountBase = Schema<components, 'BalanceAccountBase'>;
export type IBalance = Schema<components, 'Balance'>;
export type IBalanceWithKey = Schema<components, 'Balance'> & { key: string };

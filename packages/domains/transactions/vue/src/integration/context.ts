import { inject, type InjectionKey } from 'vue';
import type { TransactionsContextValue } from './types';

export const TRANSACTIONS_CONTEXT: InjectionKey<TransactionsContextValue> = Symbol('TransactionsContext');

export const useTransactionsContext = (): TransactionsContextValue => {
    const context = inject(TRANSACTIONS_CONTEXT);
    if (!context) throw new Error('Transactions context is not available.');
    return context;
};

import { inject, type InjectionKey } from 'vue';
import type { PayoutsContextValue } from './types';

export const PAYOUTS_CONTEXT: InjectionKey<PayoutsContextValue> = Symbol('PayoutsContext');

export const usePayoutsContext = (): PayoutsContextValue => {
    const context = inject(PAYOUTS_CONTEXT);
    if (!context) throw new Error('Payouts context is not available.');
    return context;
};

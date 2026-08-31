import { inject, type InjectionKey } from 'vue';
import type { DisputesContextValue } from './types';

export const DISPUTES_CONTEXT: InjectionKey<DisputesContextValue> = Symbol('DisputesContext');

export const useDisputesContext = (): DisputesContextValue => {
    const context = inject(DISPUTES_CONTEXT);
    if (!context) throw new Error('Disputes context is not available.');
    return context;
};

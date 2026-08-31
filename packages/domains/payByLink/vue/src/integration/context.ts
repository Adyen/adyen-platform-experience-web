import { inject, type InjectionKey } from 'vue';
import type { PayByLinkContextValue } from './types';

export const PAY_BY_LINK_CONTEXT: InjectionKey<PayByLinkContextValue> = Symbol('PayByLinkContext');

export const usePayByLinkContext = (): PayByLinkContextValue => {
    const context = inject(PAY_BY_LINK_CONTEXT);
    if (!context) throw new Error('Pay by Link context is not available.');
    return context;
};

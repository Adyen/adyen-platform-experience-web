import { inject, type InjectionKey } from 'vue';
import type { ReportsContextValue } from './types';

export const REPORTS_CONTEXT: InjectionKey<ReportsContextValue> = Symbol('ReportsContext');

export const useReportsContext = (): ReportsContextValue => {
    const context = inject(REPORTS_CONTEXT);
    if (!context) throw new Error('Reports context is not available.');
    return context;
};

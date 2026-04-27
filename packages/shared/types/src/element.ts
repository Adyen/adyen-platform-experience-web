import type { onErrorHandler } from '@integration-components/core';

/**
 * Props common to every external element. The concrete Core class lives in
 * `src/core/core.ts`; we type `core` loosely here so shared packages don't
 * need to pull the runtime class into the type graph.
 */
export interface BaseElementProps {
    core: any;
}

export type BaseElementState = {
    errors?: {
        [key: string]: any;
    };
    valid?: {
        [key: string]: boolean;
    };
    fieldProblems?: {
        [key: string]: any;
    };
    isValid?: boolean;
};

export type UIElementStatus = 'ready' | 'loading' | 'error' | 'success';

export interface UIElementProps {
    hideTitle?: boolean;
    onContactSupport?: () => void;
    onError?: onErrorHandler;
    ref?: any;
}

export type _UIComponentProps<T> = BaseElementProps & Omit<UIElementProps, 'ref'> & T & {};

export type ExternalUIComponentProps<T> = UIElementProps & T & {};

export const enum FilterParam {
    BALANCE_ACCOUNT = 'balanceAccount',
    CATEGORIES = 'categories',
    CURRENCIES = 'currencies',
    CREATED_SINCE = 'createdSince',
    CREATED_UNTIL = 'createdUntil',
    STATUSES = 'statuses',
    MIN_AMOUNT = 'minAmount',
    MAX_AMOUNT = 'maxAmount',
    LINK_TYPES = 'linkTypes',
    MERCHANT_REFERENCE = 'merchantReference',
    PAYMENT_LINK_ID = 'paymentLinkId',
    STORE_IDS = 'storeIds',
}

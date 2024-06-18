import UIElement from './external/UIElement';
import { Core } from '../core';

export const enum InteractionKeyCode {
    ARROW_DOWN = 'ArrowDown',
    ARROW_LEFT = 'ArrowLeft',
    ARROW_RIGHT = 'ArrowRight',
    ARROW_UP = 'ArrowUp',
    BACKSPACE = 'Backspace',
    END = 'End',
    ENTER = 'Enter',
    ESCAPE = 'Escape',
    HOME = 'Home',
    PAGE_DOWN = 'PageDown',
    PAGE_UP = 'PageUp',
    SPACE = 'Space',
    TAB = 'Tab',
}

export interface BaseElementProps {
    core: Core<any>;
}

export interface IUIElement {
    accessibleName: string;
    displayName: string;
    elementRef: any;
    type: string;
}

export interface IFormElement<P> {
    submit(): void;
    setStatus(status: UIElementStatus, props?: any): UIElement<P>;
    showValidation(): void;
    setState(newState: object): void;
}

export type UIElementStatus = 'ready' | 'loading' | 'error' | 'success';

export type SetTriggerValidation = (callback: (schema?: Record<string, any>) => void) => void;
export interface UIElementProps {
    id?: string;
    name?: string;
    ref?: any;
    onContactSupport?: () => void;
    setUIElementStatus?: (status: string) => void;

    /** @internal */
    elementRef?: any;
}

export interface FormProps<P> {
    onChange?: (state: any, element: UIElement<P> | null) => void;
    onValid?: (state: any, element: UIElement<P> | null) => void;
    beforeSubmit?: (state: any, element: UIElement<P>, actions: any) => Promise<void>;
    onSubmit?: (state: any, element: UIElement<P> | null) => void;
    onComplete?: (state: BaseElementProps, element: UIElement<P> | null) => void;
    onError?: (error: any, element?: UIElement<P> | null) => void;
    triggerValidation?: SetTriggerValidation;
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

export type _UIComponentProps<T> = BaseElementProps & UIElementProps & T & {};

export type ExternalUIComponentProps<T> = UIElementProps & T & {};

export type OnTransactionSelection = (selection: { id: string; showModal: () => void }) => any;

export type OnPayoutSelection = (selection: { balanceAccountId: string; date: string; showModal: () => void }) => any;

export interface DataOverviewComponentProps {
    name?: string;
    elementRef?: UIElement<DataOverviewComponentProps> | null;
    onRecordSelection?: OnTransactionSelection | OnPayoutSelection;
    onFiltersChanged?: (filters: { [P in FilterParam]?: string }) => any;
    onLimitChanged?: (limit: number) => any;
    preferredLimit?: 10 | 20;
    allowLimitSelection?: boolean;
    showDetails?: boolean;
    hideTitle?: boolean;
    core: Core<any>;
    balanceAccountId?: string;
}

export const enum FilterParam {
    BALANCE_ACCOUNT = 'balanceAccount',
    CATEGORIES = 'categories',
    CURRENCIES = 'currencies',
    CREATED_SINCE = 'createdSince',
    CREATED_UNTIL = 'createdUntil',
    STATUSES = 'statuses',
    MIN_AMOUNT = 'minAmount',
    MAX_AMOUNT = 'maxAmount',
}

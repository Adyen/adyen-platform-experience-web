import UIElement from './external/UIElement/UIElement';
import { Core, onErrorHandler } from '../core';
import { TransactionsTableFields } from './external/TransactionsOverview/components/TransactionsTable/types';
import type { IPayout, ITransaction } from '../types';

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
    core: Core<any, any>;
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
    hideTitle?: boolean;
    onContactSupport?: () => void;
    onError?: onErrorHandler;
    ref?: any;
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

export type _UIComponentProps<T> = BaseElementProps & Omit<UIElementProps, 'ref'> & T & {};

export type ExternalUIComponentProps<T> = UIElementProps & T & {};

type onRecordSelection<T extends { showModal: () => void }> = (selection: T) => any;

interface _DataOverviewSelectionProps<T extends { showModal: () => void } = { showModal: () => void }> {
    onRecordSelection?: onRecordSelection<T>;
}

interface _DataOverviewComponentProps<Columns, DataRetrieved> {
    allowLimitSelection?: boolean;
    balanceAccountId?: string;
    onFiltersChanged?: (filters: { [P in FilterParam]?: string }) => any;
    preferredLimit?: 10 | 20;
    showDetails?: boolean;
    customColumns?: Columns[];
    onDataRetrieved?: (data: DataRetrieved[]) => Promise<(DataRetrieved & Record<any, any>)[]>;
}

export interface TransactionOverviewComponentProps
    extends _DataOverviewComponentProps<TransactionsTableFields, ITransaction>,
        _DataOverviewSelectionProps<{ id: string; showModal: () => void }> {}

export interface PayoutsOverviewComponentProps
    extends _DataOverviewComponentProps<any, IPayout>,
        _DataOverviewSelectionProps<{ balanceAccountId: string; date: string; showModal: () => void }> {}

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

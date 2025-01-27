import UIElement from './external/UIElement/UIElement';
import { Core, onErrorHandler } from '../core';
import { TransactionsTableFields } from './external/TransactionsOverview/components/TransactionsTable/types';
import { IPayout, IReport, ITransaction } from '../types';
import { AnchorHTMLAttributes } from 'preact/compat';
import { ReportsTableFields } from './external/ReportsOverview/components/ReportsTable/ReportsTable';
import { StringWithAutocompleteOptions } from '../utils/types';
import { PayoutsTableFields } from './external/PayoutsOverview/components/PayoutsTable/PayoutsTable';

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

export type DataGridIcon = { url: string; alt?: string } | ((value: unknown) => { url: string; alt?: string });

export type DataGridCustomColumnConfig<k> = {
    key: k;
    flex?: number;
    align?: 'right' | 'left' | 'center';
};

export type CustomColumn<T extends string> = {
    [k in T]: DataGridCustomColumnConfig<k>;
}[T];

interface _DataOverviewComponentProps {
    allowLimitSelection?: boolean;
    balanceAccountId?: string;
    onFiltersChanged?: (filters: { [P in FilterParam]?: string }) => any;
    preferredLimit?: 10 | 20;
    showDetails?: boolean;
}

export type CustomDataObject = CustomIconObject | CustomTextObject | CustomLinkObject | CustomButtonObject;

interface BaseCustomObject {
    value: any;
}

type BaseDetails = {
    classNames?: string;
};

export interface CustomIconObject extends BaseCustomObject {
    type: 'icon';
    details: BaseDetails & { src: string; alt?: string };
}

export interface CustomTextObject extends BaseCustomObject {
    type: 'text';
    details: BaseDetails;
}

export interface CustomLinkObject extends BaseCustomObject {
    type: 'link';
    details: BaseDetails & { href: string; target?: AnchorHTMLAttributes<any>['target'] };
}

export interface CustomButtonObject extends BaseCustomObject {
    type: 'button';
    details: BaseDetails & { action: () => void };
}

export type CustomDataRetrieved = { [k: string]: CustomDataObject | (string | number) };

export type OnDataRetrievedCallback<DataRetrieved> = (data: DataRetrieved[]) => Promise<CustomDataRetrieved[]>;

interface _CustomizableDataOverview<Columns extends string, DataRetrieved> {
    columns?: CustomColumn<Columns>[] | Columns[];
    onDataRetrieved?: OnDataRetrievedCallback<DataRetrieved>;
}

export interface ReportsOverviewComponentProps
    extends Omit<_DataOverviewComponentProps, 'showDetails'>,
        _CustomizableDataOverview<StringWithAutocompleteOptions<ReportsTableFields>, IReport> {}

export interface TransactionOverviewComponentProps
    extends _DataOverviewComponentProps,
        _CustomizableDataOverview<TransactionsTableFields, ITransaction>,
        _DataOverviewSelectionProps<{ id: string; showModal: () => void }> {}

export interface PayoutsOverviewComponentProps
    extends _DataOverviewComponentProps,
        _CustomizableDataOverview<StringWithAutocompleteOptions<PayoutsTableFields>, IPayout>,
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

export type ExternalComponentType =
    | 'transactions'
    | 'transactionDetails'
    | 'payouts'
    | 'payoutDetails'
    | 'reports'
    | 'capitalOverview'
    | 'capitalOffer';

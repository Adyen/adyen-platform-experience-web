import UIElement from './external/UIElement/UIElement';
import { Core, onErrorHandler } from '../core';
import { TransactionsTableFields } from './external/TransactionsOverview/components/TransactionsTable/types';
import { IPayout, IPayoutDetails, IReport, ITransaction, ITransactionWithDetails } from '../types';
import { AnchorHTMLAttributes } from 'preact/compat';
import { ReportsTableFields } from './external/ReportsOverview/components/ReportsTable/ReportsTable';
import { StringWithAutocompleteOptions } from '../utils/types';
import { PayoutsTableFields } from './external/PayoutsOverview/components/PayoutsTable/PayoutsTable';
import { TransactionDetailsFields } from './external';
import { IDisputeListItem } from '../types/api/models/disputes';
import { DisputesTableFields } from './external/DisputesOverview/components/DisputesTable/DisputesTable';
import { PBLFormValues } from './external/PayByLink/PayByLinkCreation/components/types';

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
    DELETE = 'Delete',
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
    visibility?: 'visible' | 'hidden';
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
    onContactSupport?: () => void;
}

export type CustomDataObject = CustomIconObject | CustomTextObject | CustomLinkObject | CustomButtonObject;

interface BaseCustomObject {
    value: any;
}

type BaseDetails = {
    className?: string;
};

export interface CustomIconObject extends BaseCustomObject {
    type: 'icon';
    config: BaseDetails & { src: string; alt?: string };
}

export interface CustomTextObject extends BaseCustomObject {
    type: 'text';
    config?: BaseDetails;
}

export interface CustomLinkObject extends BaseCustomObject {
    type: 'link';
    config: BaseDetails & { href: string; target?: AnchorHTMLAttributes<any>['target'] };
}

export interface CustomButtonObject extends BaseCustomObject {
    type: 'button';
    config: BaseDetails & { action: () => void };
}

export type CustomDataRetrieved = { [k: string]: CustomDataObject | Record<any, any> | string | number | boolean };

export type OnDataRetrievedCallback<DataRetrieved, CallbackResponse = CustomDataRetrieved[]> = (data: DataRetrieved) => Promise<CallbackResponse>;

export type DataCustomizationObject<Columns extends string, DataRetrieved, CallbackResponse> = {
    fields: CustomColumn<StringWithAutocompleteOptions<Columns>>[];
    onDataRetrieve?: OnDataRetrievedCallback<DataRetrieved, CallbackResponse>;
};

export type DetailsCustomFieldConfig<k> = {
    key: k;
    visibility?: 'visible' | 'hidden';
};

export type CustomDetailsField<T extends string> = {
    [k in T]: DetailsCustomFieldConfig<k>;
}[T];

export type DetailsDataCustomizationObject<Columns extends string, DataRetrieved, CallbackResponse> = {
    fields: CustomDetailsField<StringWithAutocompleteOptions<Columns>>[];
    onDataRetrieve?: OnDataRetrievedCallback<DataRetrieved, CallbackResponse>;
};

interface _CustomizableDataOverview<CustomizationOptions extends Record<string, DataCustomizationObject<any, any, any>>> {
    dataCustomization?: CustomizationOptions;
}

type OverviewCustomizationProperties<Fields extends string, Data, DetailsFields extends string, DetailsData> = {
    list?: DataCustomizationObject<Fields, Data[], CustomDataRetrieved[]>;
    details?: DetailsDataCustomizationObject<DetailsFields, DetailsData, CustomDataRetrieved>;
};

export interface ReportsOverviewComponentProps
    extends Omit<_DataOverviewComponentProps, 'showDetails'>,
        _CustomizableDataOverview<Omit<OverviewCustomizationProperties<ReportsTableFields, IReport, any, any>, 'details'>> {}

export interface TransactionOverviewComponentProps
    extends _DataOverviewComponentProps,
        _CustomizableDataOverview<
            OverviewCustomizationProperties<TransactionsTableFields, ITransaction, TransactionDetailsFields, ITransactionWithDetails>
        >,
        _DataOverviewSelectionProps<{ id: string; showModal: () => void }> {}

export interface PayByLinkOverviewComponentProps
    extends _DataOverviewComponentProps,
        _DataOverviewSelectionProps<{ id: string; showModal: () => void }> {}

export interface PayoutsOverviewComponentProps
    extends _DataOverviewComponentProps,
        _CustomizableDataOverview<OverviewCustomizationProperties<PayoutsTableFields, IPayout, any, IPayoutDetails>>,
        _DataOverviewSelectionProps<{ balanceAccountId: string; date: string; showModal: () => void }> {}

export interface DisputeOverviewComponentProps
    extends _DataOverviewComponentProps,
        _CustomizableDataOverview<Omit<OverviewCustomizationProperties<DisputesTableFields, IDisputeListItem, any, any>, 'list'>>,
        _DataOverviewSelectionProps<{ id: string; showModal: () => void }> {}

export type DeepPartial<T> = T extends object
    ? {
          [K in keyof T]?: DeepPartial<T[K]>;
      }
    : T;

export interface PayByLinkCreationComponentProps extends UIElementProps {
    fieldsConfig?: {
        data: DeepPartial<PBLFormValues>;
    };
    storeIds: string[] | string;
    onPaymentLinkCreated?: (paymentLink: PBLFormValues) => void;
    onCreationDismiss?: () => void;
}

export interface PayByLinkSettingsComponentProps extends UIElementProps {
    // Placeholder for component props
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
    LINK_TYPES = 'linkTypes',
    MERCHANT_REFERENCE = 'merchantReference',
    PAYMENT_LINK_ID = 'paymentLinkId',
    STORE_IDS = 'storeIds',
}

export type ExternalComponentType =
    | 'transactions'
    | 'transactionDetails'
    | 'payouts'
    | 'payoutDetails'
    | 'reports'
    | 'capitalOverview'
    | 'capitalOffer'
    | 'disputes'
    | 'disputesManagement'
    | 'payByLinkCreation'
    | 'payByLinkTheme'
    | 'payByLinkOverview'
    | 'payByLinkSettings'
    | 'paymentLinkDetails';

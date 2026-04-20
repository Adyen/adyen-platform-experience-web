import UIElement from './external/UIElement/UIElement';
import { Core, onErrorHandler } from '../core';
import { AnchorHTMLAttributes } from 'preact/compat';
import { StringWithAutocompleteOptions } from '../utils/types';

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

export type { ReportsOverviewComponentProps, ReportsOverviewProps } from './external/ReportsOverview/types';
export type { ReportsTableFields } from './external/ReportsOverview/types';

export type { TransactionsOverviewComponentProps } from './external/TransactionsOverview/types';
export type { TransactionsOverviewProps, TransactionsTableFields, TransactionsFilters } from './external/TransactionsOverview/types';

export type { PaymentLinksOverviewComponentProps, PaymentLinksOverviewProps } from './external/PaymentLinksOverview/types';
export type { StoreIds } from './external/PaymentLinksOverview/types';

export type { PayoutsOverviewComponentProps, PayoutsOverviewProps } from './external/PayoutsOverview/types';
export type { PayoutsTableFields } from './external/PayoutsOverview/types';

export type { DisputeOverviewComponentProps, DisputesOverviewProps } from './external/DisputesOverview/types';
export type { DisputesTableFields, DisputeStatusGroup } from './external/DisputesOverview/types';

export type DeepPartial<T> = T extends object
    ? {
          [K in keyof T]?: DeepPartial<T[K]>;
      }
    : T;

export type { CapitalOverviewComponentProps, CapitalOverviewProps } from './external/CapitalOverview/types';

export type { CapitalOfferComponentProps, CapitalOfferProps } from './external/CapitalOffer/types';

export type { PaymentLinkCreationComponentProps, PaymentLinkCreationProps } from './external/PaymentLinkCreation/types';
export type { PaymentLinkFieldsVisibilityConfig, PaymentLinkCreationFieldsConfig } from './external/PaymentLinkCreation/types';

export type { PaymentLinkSettingsComponentProps, PaymentLinkSettingsProps } from './external/PaymentLinkSettings/types';

export type { PaymentLinkDetailsComponentProps, PaymentLinkDetailsProps } from './external/PaymentLinkDetails/types';

export type { PayoutDetailsComponentProps, PayoutDetailsProps } from './external/PayoutDetails/types';

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

export type { ExternalComponentType } from '@integration-components/types';

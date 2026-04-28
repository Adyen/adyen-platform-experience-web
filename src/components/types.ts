import UIElement from './external/UIElement/UIElement';
import { Core } from '../core';
import { StringWithAutocompleteOptions } from '../utils/types';
import type {
    BaseElementProps as _BaseElementProps,
    BaseElementState,
    CustomColumn,
    CustomButtonObject,
    CustomDataObject,
    CustomDataRetrieved,
    CustomIconObject,
    CustomLinkObject,
    CustomTextObject,
    DataCustomizationObject,
    DataGridCustomColumnConfig,
    ExternalUIComponentProps,
    OnDataRetrievedCallback,
    UIElementProps,
    UIElementStatus,
    _UIComponentProps as __UIComponentProps,
} from '@integration-components/types';

export { FilterParam } from '@integration-components/types';

export type {
    CustomButtonObject,
    CustomColumn,
    CustomDataObject,
    CustomDataRetrieved,
    CustomIconObject,
    CustomLinkObject,
    CustomTextObject,
    DataCustomizationObject,
    DataGridCustomColumnConfig,
    ExternalUIComponentProps,
    OnDataRetrievedCallback,
    UIElementProps,
    UIElementStatus,
};

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

export interface BaseElementProps extends _BaseElementProps {
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

export type SetTriggerValidation = (callback: (schema?: Record<string, any>) => void) => void;

export interface FormProps<P> {
    onChange?: (state: any, element: UIElement<P> | null) => void;
    onValid?: (state: any, element: UIElement<P> | null) => void;
    beforeSubmit?: (state: any, element: UIElement<P>, actions: any) => Promise<void>;
    onSubmit?: (state: any, element: UIElement<P> | null) => void;
    onComplete?: (state: BaseElementProps, element: UIElement<P> | null) => void;
    onError?: (error: any, element?: UIElement<P> | null) => void;
    triggerValidation?: SetTriggerValidation;
}

export type { BaseElementState };

export type _UIComponentProps<T> = __UIComponentProps<T>;

export type DataGridIcon = { url: string; alt?: string } | ((value: unknown) => { url: string; alt?: string });

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

export type { ExternalComponentType } from '@integration-components/types';

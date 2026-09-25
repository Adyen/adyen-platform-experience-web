import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';
import type { CustomColumn } from './dataGrid';

export type Appearance = {
    illustrations?: 'hidden' | 'visible';
    titles?: 'hidden' | 'visible';
};

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
    config: BaseDetails & { href: string; target?: HTMLAnchorElement['target'] };
}

export interface CustomButtonObject extends BaseCustomObject {
    type: 'button';
    config: BaseDetails & { action: () => void };
}

export type CustomDataObject = CustomIconObject | CustomTextObject | CustomLinkObject | CustomButtonObject;

export type CustomDataRetrieved = { [k: string]: CustomDataObject | Record<any, any> | string | number | boolean };

export type OnDataRetrievedCallback<DataRetrieved, CallbackResponse = CustomDataRetrieved[]> = (data: DataRetrieved) => Promise<CallbackResponse>;

export type DataCustomizationObject<Columns extends string, DataRetrieved, CallbackResponse> = {
    fields: CustomColumn<StringWithAutocompleteOptions<Columns>>[];
    onDataRetrieve?: OnDataRetrievedCallback<DataRetrieved, CallbackResponse>;
};

export type DetailsCustomFieldConfig<K> = {
    key: K;
    visibility?: 'visible' | 'hidden';
};

export type CustomDetailsField<T extends string> = {
    [K in T]: DetailsCustomFieldConfig<K>;
}[T];

export type DetailsDataCustomizationObject<Columns extends string, DataRetrieved, CallbackResponse> = {
    fields: CustomDetailsField<StringWithAutocompleteOptions<Columns>>[];
    onDataRetrieve?: OnDataRetrievedCallback<DataRetrieved, CallbackResponse>;
};

export interface DetailsWithExtraData<T extends DetailsDataCustomizationObject<any, any, any>> {
    dataCustomization?: {
        details?: T;
    };
}

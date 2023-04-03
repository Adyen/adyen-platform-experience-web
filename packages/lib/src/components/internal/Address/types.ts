import { AddressField, AddressData } from '../../../types';
import Specifications from './Specifications';
import { ValidatorRules } from '../../../utils/Validator/types';
import { ValidationRuleResult } from '../../../utils/Validator/ValidationRuleResult';
import { FormState, SchemaKeys } from '../../../utils/useForm/types';
import { TargetedEvent } from 'preact/compat';
import { SetTriggerValidation } from '../../types';

// Describes an object with unknown keys whose value is always a string
export type StringObject = {
    [key: string]: string;
};

export interface AddressProps<FormSchema extends Record<string, any>> {
    allowedCountries?: string[];
    countryCode: string;
    data?: AddressData;
    label?: string;
    onChange?: (newState: FormState<FormSchema>) => void;
    requiredFields?: SchemaKeys<FormSchema>[];
    ref?: any;
    specifications: AddressSpecifications;
    validationRules?: ValidatorRules<FormSchema>;
    visibility?: string;
    overrideSchema?: AddressSpecifications;
    iOSFocusedField?: string;
    setTriggerValidation?: SetTriggerValidation;
}

export interface AddressState<FormSchema extends Record<string, any>> {
    street?: ValidationRuleResult<FormSchema>;
    houseNumberOrName?: ValidationRuleResult<FormSchema>;
    postalCode?: ValidationRuleResult<FormSchema>;
    city?: ValidationRuleResult<FormSchema>;
    country?: ValidationRuleResult<FormSchema>;
    stateOrProvince?: ValidationRuleResult<FormSchema>;
}

export interface FieldContainerProps<FormSchema extends Record<string, any>> {
    allowedCountries: string[];
    classNameModifiers: string[];
    data: AddressData;
    errors: AddressState<FormSchema>;
    fieldName: keyof AddressData;
    key: string;
    valid?: { [k: string]: any };
    onInput: (e: TargetedEvent<HTMLInputElement, Event>) => void;
    onBlur?: (e: Event) => void;
    onDropdownChange: (e: Event) => void;
    readOnly?: boolean;
    specifications: Specifications;
    maxlength?: number;
    trimOnBlur?: boolean;
    disabled?: boolean;
}

export interface ReadOnlyAddressProps {
    data: AddressData;
    label: string;
}

export interface CountryFieldProps {
    allowedCountries: string[];
    classNameModifiers: string[];
    label: string;
    errorMessage: boolean | string;
    onDropdownChange: (e: Event) => void;
    readOnly?: boolean;
    value: string;
}

export interface CountryFieldItem {
    id: string;
    name: string;
}

export interface StateFieldProps {
    classNameModifiers: string[];
    label: string;
    errorMessage: boolean | string;
    onDropdownChange: (e: Event) => void;
    readOnly?: boolean;
    selectedCountry: string;
    specifications: Specifications;
    value: string;
}

export interface StateFieldItem {
    id: string;
    name: string;
}

export type AddressFieldsGroup = [AddressField, number][];
export type AddressSchema = (AddressField | AddressFieldsGroup)[];

type SpecificationFields = {
    hasDataset?: boolean;
    labels?: StringObject;
    optionalFields?: AddressField[];
    placeholders?: StringObject;
    schema?: AddressSchema;
};

export type AddressSpecifications = {
    countryHasOptionalField?: (country: string, field: string) => boolean;
    default: SpecificationFields & { schema: AddressSchema };
} & {
    [key: string]: SpecificationFields;
};

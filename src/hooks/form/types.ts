// Core form types
import { ComponentChild } from 'preact';
import Localization from '../../core/Localization';

export type FieldValue = string | number | boolean | string[] | number[] | FileList | Date | null | undefined;
export type FieldError = { message?: string; type: 'validation' | 'required' } | undefined;

// Validation rule types
export type ValidationValue = string | number | boolean;
export type ValidationResult = { valid: boolean; message?: string };
export type ValidateFn<TValue = any> = (value: TValue) => ValidationResult | Promise<ValidationResult>;

type Primitive = string | number | boolean | Date | File | FileList | null | undefined;

type NestedPaths<T, Prefix extends string = ''> = T extends Primitive | any[]
    ? Prefix
    : {
          [K in keyof T & string]: K extends string
              ? Prefix extends ''
                  ? K | NestedPaths<T[K], K>
                  : `${Prefix}.${K}` | NestedPaths<T[K], `${Prefix}.${K}`>
              : never;
      }[keyof T & string];

// Replace the existing FieldValues type with this:
export type FieldValues<TFieldValues> = NestedPaths<TFieldValues> | Exclude<keyof TFieldValues, number | symbol>;

export interface ValidationRules {
    required?: boolean;
    validate?: ValidateFn;
}

// Form state types
export interface FormState<TFieldValues> {
    dirtyFields: Partial<Record<FieldValues<TFieldValues>, boolean>>;
    touchedFields: Partial<Record<FieldValues<TFieldValues>, boolean>>;
    isSubmitting: boolean;
    isValid: boolean;
    errors: Partial<Record<FieldValues<TFieldValues>, FieldError>>;
}

// Controller field state
export interface ControllerFieldState {
    error?: FieldError;
    isTouched: boolean;
    isDirty: boolean;
}

// Field object for Controller
export interface ControllerRenderProps<TFieldValues> {
    field: {
        name: FieldValues<TFieldValues>;
        value: FieldValue;
        // Support both event-based and direct value updates for flexibility
        onInput: (value: any) => void;
        onBlur: () => void;
        triggerValidation: () => void;
    };
    fieldState: ControllerFieldState;
    formState: FormState<TFieldValues>;
}

// UseForm options
export interface UseFormOptions<TFieldValues> {
    defaultValues?: Partial<TFieldValues>;
    i18n: Localization['i18n'];
    mode?: 'onBlur' | 'onInput' | 'all';
}

// Public form control interface - only exposes public methods
export interface FormControl<TFieldValues> {
    subscribe: (callback: () => void) => () => void;
    notify: () => void;

    // Public APIs to interact without touching internals
    setValue: (
        name: FieldValues<TFieldValues>,
        value: FieldValue,
        options?: { shouldValidate?: boolean; shouldDirty?: boolean; shouldTouch?: boolean }
    ) => void;
    setTouched: (name: FieldValues<TFieldValues>, touched: boolean) => void;
    getValue: (name: FieldValues<TFieldValues>) => any;
    getFieldState: (name: FieldValues<TFieldValues>) => ControllerFieldState;
    getFormState: () => FormState<TFieldValues>;
    register: (name: FieldValues<TFieldValues>, rules: ValidationRules) => () => void;
    trigger: (name?: FieldValues<TFieldValues> | FieldValues<TFieldValues>[]) => Promise<boolean>;
}

// Internal form control interface - includes all state properties
// This should only be used internally within the form system implementation
export interface InternalFormControl<TFieldValues> extends FormControl<TFieldValues> {
    _values: Map<FieldValues<TFieldValues>, FieldValue>;
    _errors: Map<FieldValues<TFieldValues>, FieldError>;
    _touched: Map<FieldValues<TFieldValues>, boolean>;
    _dirty: Map<FieldValues<TFieldValues>, boolean>;
    _subscribers: Set<() => void>;
    _validationCounters: Map<FieldValues<TFieldValues>, number>;
    _fieldRules: Map<FieldValues<TFieldValues>, ValidationRules>;
    _options: UseFormOptions<TFieldValues>;
    _defaultValues: Partial<TFieldValues>;
    _isSubmitting: boolean;
    // Pre-computed state objects to avoid redundant reconstructions
    _computedErrors: Partial<Record<FieldValues<TFieldValues>, FieldError>>;
    _computedTouchedFields: Partial<Record<FieldValues<TFieldValues>, boolean>>;
    _computedDirtyFields: Partial<Record<FieldValues<TFieldValues>, boolean>>;
}

// UseForm return type
export interface UseFormReturn<TFieldValues> {
    control: FormControl<TFieldValues>;
    handleSubmit: (
        onValid: (data: TFieldValues) => void | Promise<void>,
        onInvalid?: (errors: Record<string, FieldError>) => void
    ) => (e?: Event) => Promise<void>;
    setValue: (
        name: FieldValues<TFieldValues>,
        value: FieldValue,
        options?: { shouldValidate?: boolean; shouldDirty?: boolean; shouldTouch?: boolean }
    ) => void;
    getValues: (name?: FieldValues<TFieldValues>) => any;
    reset: (values?: Partial<TFieldValues>) => void;
    formState: FormState<TFieldValues>;
    trigger: (name?: FieldValues<TFieldValues> | FieldValues<TFieldValues>[]) => Promise<boolean>;
}

// Controller props
export interface ControllerProps<TFieldValues> {
    name: FieldValues<TFieldValues>;
    control: FormControl<TFieldValues>;
    rules?: ValidationRules;
    render: (props: ControllerRenderProps<TFieldValues>) => ComponentChild;
}

// Form context value
export type FormContextValue<TFieldValues> = UseFormReturn<TFieldValues>;

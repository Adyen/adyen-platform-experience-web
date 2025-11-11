// Core form types
import { ComponentChild } from 'preact';

export type FieldValue = string | number | boolean;
export type FieldError = { message?: string; type: 'validation' | 'required' } | undefined;

// Validation rule types
export type ValidationValue = string | number | boolean;
export type ValidationResult = { valid: boolean; message?: string };
export type ValidateFn<TValue = any> = (value: TValue) => ValidationResult | Promise<ValidationResult>;

export type FieldValues<TFieldValues> = Exclude<keyof TFieldValues, number | symbol>;

export interface ValidationRules {
    required?: boolean;
    validate?: ValidateFn;
}

// Form state types
export interface FormState<TFieldValues> {
    dirtyFields: Partial<Record<FieldValues<TFieldValues>, boolean>>;
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
    };
    fieldState: ControllerFieldState;
    formState: FormState<TFieldValues>;
}

// UseForm options
export interface UseFormOptions<TFieldValues> {
    defaultValues?: Partial<TFieldValues>;
    mode?: 'onBlur' | 'onInput' | 'all';
}

// Public form control interface - only exposes public methods
export interface FormControl {
    subscribe: (callback: () => void) => () => void;
    notify: () => void;
}

// Internal form control interface - includes all state properties
// This should only be used internally within the form system implementation
export interface InternalFormControl<TFieldValues> extends FormControl {
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
    control: FormControl;
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
    control: FormControl;
    rules?: ValidationRules;
    render: (props: ControllerRenderProps<TFieldValues>) => ComponentChild;
}

// Form context value
export type FormContextValue<TFieldValues> = UseFormReturn<TFieldValues>;

// Core form types
import { ComponentChild } from 'preact';

export type FieldValue = unknown;
export type FieldError = { message: string; type: string } | undefined;
export type FieldPath = string;

// Validation rule types
export type ValidationValue = string | number | boolean;
export type ValidationResult = string | boolean | undefined;
export type ValidateFn<TValue = any> = (value: TValue) => ValidationResult | Promise<ValidationResult>;

export interface ValidationRules {
    required?: string | boolean;
    minLength?: { value: number; message: string } | number;
    maxLength?: { value: number; message: string } | number;
    pattern?: { value: RegExp; message: string } | RegExp;
    validate?: ValidateFn | Record<string, ValidateFn>;
}

// Form state types
export interface FormState {
    errors: Record<FieldPath, FieldError>;
    touchedFields: Record<FieldPath, boolean>;
    dirtyFields: Record<FieldPath, boolean>;
    isSubmitting: boolean;
    isValid: boolean;
}

// Controller field state
export interface ControllerFieldState {
    error?: FieldError;
    isTouched: boolean;
    isDirty: boolean;
}

// Field object for Controller
export interface ControllerRenderProps {
    field: {
        name: string;
        value: FieldValue;
        // Support both event-based and direct value updates for flexibility
        onInput: (value: any) => void;
        onBlur: () => void;
    };
    fieldState: ControllerFieldState;
    formState: FormState;
}

// UseForm options
export interface UseFormOptions<TFieldValues = Record<string, any>> {
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
export interface InternalFormControl<TFieldValues = Record<string, any>> extends FormControl {
    _values: Map<string, FieldValue>;
    _errors: Map<string, FieldError>;
    _touched: Map<string, boolean>;
    _dirty: Map<string, boolean>;
    _subscribers: Set<() => void>;
    _validationCounters: Map<string, number>;
    _fieldRules: Map<string, ValidationRules>;
    _options: UseFormOptions<TFieldValues>;
    _defaultValues: Partial<TFieldValues>;
    _isSubmitting: boolean;
    // Pre-computed state objects to avoid redundant reconstructions
    _computedErrors: Record<string, FieldError>;
    _computedTouchedFields: Record<string, boolean>;
    _computedDirtyFields: Record<string, boolean>;
}

// UseForm return type
export interface UseFormReturn<TFieldValues = Record<string, any>> {
    control: FormControl;
    handleSubmit: (
        onValid: (data: TFieldValues) => void | Promise<void>,
        onInvalid?: (errors: Record<string, FieldError>) => void
    ) => (e?: Event) => Promise<void>;
    setValue: (name: FieldPath, value: FieldValue, options?: { shouldValidate?: boolean; shouldDirty?: boolean; shouldTouch?: boolean }) => void;
    getValues: (name?: FieldPath) => any;
    reset: (values?: Partial<TFieldValues>) => void;
    formState: FormState;
    trigger: (name?: FieldPath | FieldPath[]) => Promise<boolean>;
}

// Controller props
export interface ControllerProps {
    name: FieldPath;
    control: FormControl;
    rules?: ValidationRules;
    render: (props: ControllerRenderProps) => ComponentChild;
}

// Form context value
export type FormContextValue<TFieldValues = Record<string, any>> = UseFormReturn<TFieldValues>;

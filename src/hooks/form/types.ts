import { TargetedEvent } from 'preact/compat';

// Core form types
export type FieldValue = any;
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
export interface FormState<TFieldValues = Record<string, any>> {
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
export interface ControllerRenderProps<TFieldValues = Record<string, any>> {
    field: {
        name: string;
        value: FieldValue;
        onInput: (e: TargetedEvent<HTMLInputElement, Event>) => void;
        onBlur: () => void;
    };
    fieldState: ControllerFieldState;
    formState: FormState<TFieldValues>;
}

// UseForm options
export interface UseFormOptions<TFieldValues = Record<string, any>> {
    defaultValues?: Partial<TFieldValues>;
    mode?: 'onBlur' | 'onInput' | 'all';
}

// Form control object
export interface FormControl<TFieldValues = Record<string, any>> {
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
    subscribe: (callback: () => void) => () => void;
    notify: () => void;
}

// UseForm return type
export interface UseFormReturn<TFieldValues = Record<string, any>> {
    control: FormControl<TFieldValues>;
    handleSubmit: (
        onValid: (data: TFieldValues) => void | Promise<void>,
        onInvalid?: (errors: Record<string, FieldError>) => void
    ) => (e?: Event) => Promise<void>;
    setValue: (name: FieldPath, value: FieldValue, options?: { shouldValidate?: boolean; shouldDirty?: boolean; shouldTouch?: boolean }) => void;
    getValues: (name?: FieldPath) => any;
    reset: (values?: Partial<TFieldValues>) => void;
    formState: FormState<TFieldValues>;
    trigger: (name?: FieldPath | FieldPath[]) => Promise<boolean>;
}

// Controller props
export interface ControllerProps<TFieldValues = Record<string, any>> {
    name: FieldPath;
    control: FormControl<TFieldValues>;
    rules?: ValidationRules;
    render: (props: ControllerRenderProps<TFieldValues>) => any;
}

// Form context value
export interface FormContextValue<TFieldValues = Record<string, any>> extends UseFormReturn<TFieldValues> {}

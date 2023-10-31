import { ValidatorMode, ValidatorRules } from '../Validator/types';
import { ValueOf } from '../types';
import { CoreContextWithTranslationsI18n } from '@src/core/Context/types';

export interface FieldErrors {
    [key: string]: any;
}
export type FieldProblems<FormSchema extends Record<string, unknown>> = {
    [k in keyof FormSchema]: any;
};
export type SchemaKeys<FormSchema extends Record<string, unknown>> = Extract<keyof FormSchema, string>;

export type FormValidField<FormSchema> = {
    [key in keyof FormSchema]: boolean;
};

export type FormState<FormSchema extends Record<string, unknown>> = {
    local?: Partial<FormState<FormSchema>>;
    schema?: SchemaKeys<FormSchema>[];
    data: FormSchema;
    errors: {
        [key: string]: any;
    };
    valid: {
        [key in keyof FormSchema]: boolean;
    };
    fieldProblems?: {
        [key: string]: any;
    };
    isValid?: boolean;
};

export type FormProps<FormSchema extends Record<string, unknown>, Props = {}> = {
    rules?: ValidatorRules<FormSchema>;
    formatters?: any;
    defaultData?: Partial<FormSchema>;
    fieldProblems?: any;
    schema: SchemaKeys<FormSchema>[];
    i18n?: CoreContextWithTranslationsI18n;
} & { [k in keyof Props]?: Props[k] };

export interface Form<FormSchema extends Record<string, unknown>> extends FormState<FormSchema> {
    handleChangeFor: (key: SchemaKeys<FormSchema>, mode?: ValidatorMode) => (e: any) => void;
    triggerValidation: (schema?: any) => void;
    setSchema: (schema: any) => void;
    setData: (key: SchemaKeys<FormSchema>, value: FormSchema[Extract<keyof FormSchema, string>]) => void;
    setValid: (key: Extract<keyof FormSchema, string>, value: Boolean) => void;
    setErrors: (key: Extract<keyof FormSchema, string>, value: FieldErrors) => void;
    setFieldProblems: (fieldProblems: FieldProblems<FormSchema>) => void;
    mergeForm: (formValue: FormState<FormSchema>) => void;
}

type BaseReducerAction<FormSchema extends Record<string, unknown>> = {
    key: SchemaKeys<FormSchema>;
    value: string | boolean | null | FieldErrors | ValueOf<FormSchema>;
};

export interface ReducerActionType<FormSchema extends Record<string, unknown>> {
    updateField: BaseReducerAction<FormSchema> & { mode?: ValidatorMode };
    validateForm: { selectedSchema: SchemaKeys<FormSchema>[] | null };
    setErrors: BaseReducerAction<FormSchema>;
    setValid: BaseReducerAction<FormSchema>;
    setData: BaseReducerAction<FormSchema>;
    setSchema: {
        schema: SchemaKeys<FormSchema>[];
        defaultData: Partial<FormSchema>;
        fieldProblems?: FieldProblems<FormSchema>;
    };
    mergeForm: { formValue: FormState<FormSchema> };
    setFieldProblems: {
        fieldProblems: FieldProblems<FormSchema>;
    };
}

type DistributePayloadTypes<FormSchema extends Record<string, unknown>, U extends keyof ReducerActionType<FormSchema>> = U extends any
    ? { type: U; payload: ReducerActionType<FormSchema>[U] }
    : never;

export type ReducerPayloadParams<FormSchema extends Record<string, unknown>> = DistributePayloadTypes<
    FormSchema,
    keyof ReducerActionType<FormSchema>
>;

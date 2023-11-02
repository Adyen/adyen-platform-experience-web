import { useCallback, useEffect, useMemo, useReducer } from 'preact/hooks';
import Validator from '../Validator';
import { DefaultState, FieldProcessor, getReducer, init } from './reducer';
import { Form, FormState, FormProps, FieldErrors, ReducerPayloadParams, SchemaKeys, FieldProblems } from './types';
import { ValidatorMode } from '../Validator/types';
import { isFunction } from '@src/utils/common';

function useForm<FormSchema extends Record<string, any>, Props>(props: FormProps<FormSchema, Props>): Form<FormSchema> {
    const { rules = {}, formatters = {}, defaultData = {}, fieldProblems = {}, schema = [] } = props;

    const validator = useMemo(() => new Validator(rules), [rules]);

    /** Formats and validates a field */
    const processField: FieldProcessor<FormSchema> = ({ key, value, mode }, fieldContext) => {
        // Find a formatting function either stored under 'key' or a level deeper under a 'formatter' property
        const formatterFn = formatters?.[key]?.formatter ? formatters[key].formatter : formatters?.[key];
        const formattedValue = formatterFn && isFunction(formatterFn) ? formatterFn(value ?? '', fieldContext) : value;

        const validationResult = validator.validate({ key, value: formattedValue, mode }, fieldContext);
        return [formattedValue, validationResult];
    };

    const [state, dispatch] = useReducer<FormState<FormSchema>, ReducerPayloadParams<FormSchema>, DefaultState<FormSchema>>(
        getReducer<FormSchema>(processField),
        { defaultData, schema: schema ?? [], processField, fieldProblems },
        init
    );
    const isValid = useMemo(() => state.schema?.reduce((acc, val) => (acc && state.valid[val]) ?? false, true), [state.schema, state.valid]);

    const getTargetValue = (key: Extract<keyof FormSchema, string>, e: Event) => {
        if (!e.target) return null;

        if ((e.target as HTMLInputElement)?.type === 'checkbox') {
            return !state.data[key];
        }
        return (e.target as HTMLInputElement).value;
    };

    /** Formats, validates, and stores a new value for a form field */
    const handleChangeFor = (key: Extract<keyof FormSchema, string>, mode?: ValidatorMode) => {
        return (e: Event) => {
            const value = getTargetValue(key, e);
            dispatch({ type: 'updateField', payload: { key, value, mode } });
        };
    };

    /** Validates every field in the form OR just those in selectedSchema */
    const triggerValidation = useCallback((selectedSchema: Extract<keyof FormSchema, string>[] | null = null) => {
        dispatch({ type: 'validateForm', payload: { selectedSchema } });
    }, []);

    const setErrors = useCallback(
        (key: Extract<keyof FormSchema, string>, value: FieldErrors) => dispatch({ type: 'setErrors', payload: { key, value } }),
        []
    );
    const setValid = useCallback(
        (key: Extract<keyof FormSchema, string>, value: Boolean) => dispatch({ type: 'setValid', payload: { key, value } }),
        []
    );
    const setData = useCallback(
        (key: Extract<keyof FormSchema, string>, value: FormSchema[typeof key]) => dispatch({ type: 'setData', payload: { key, value } }),
        []
    );
    const setSchema = useCallback(
        (schema: SchemaKeys<FormSchema>[]) => dispatch({ type: 'setSchema', payload: { schema, defaultData } }),
        [state.schema, defaultData]
    );
    const mergeForm = useCallback((formValue: FormState<FormSchema>) => dispatch({ type: 'mergeForm', payload: { formValue } }), []);
    const setFieldProblems = useCallback(
        (fieldProblems: FieldProblems<FormSchema>) => dispatch({ type: 'setFieldProblems', payload: { fieldProblems } }),
        [state.schema, defaultData]
    );

    // Set reducer fields problems if fieldProblems prop changes
    useEffect(() => {
        setFieldProblems(fieldProblems ?? {});
    }, [JSON.stringify(fieldProblems)]);

    return {
        handleChangeFor,
        triggerValidation,
        setSchema,
        setData,
        setValid,
        setErrors,
        isValid,
        mergeForm,
        setFieldProblems,
        schema: state.schema,
        valid: state.valid,
        errors: state.errors,
        data: state.data,
        fieldProblems: state.fieldProblems,
    };
}

export default useForm;

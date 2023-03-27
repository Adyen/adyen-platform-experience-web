import { FieldProblems, FormState, FormValidField, ReducerPayloadParams, SchemaKeys } from './types';
import { ValidationRuleResult } from '../Validator/ValidationRuleResult';
import { ValidatorMode } from '../Validator/types';
const omitKeys = (obj: Record<string, any>, omit: string[]) =>
    Object.keys(obj)
        .filter(k => !omit.includes(k))
        .reduce((a, c) => {
            a[c] = obj[c];
            return a;
        }, {} as Record<string, any>);

const addKeys = (
    obj: Record<string, any>,
    add: string[],
    initialValue: null | false,
    defaultData: Record<string, any>,
    pendingData?: Record<string, any>
) => add.reduce((a, c) => ({ ...a, [c]: a[c] ?? pendingData?.[c] ?? defaultData?.[c] ?? initialValue }), obj);

/**
 * Processes default data and sets as default in state
 */

export type FieldProcessor<Schema extends Record<string, any>> = (
    field: {
        key: Extract<keyof Schema, string>;
        value: unknown;
        mode: ValidatorMode;
    },
    state: { state: { data: Partial<Schema> } }
) => [string, { isValid: boolean; hasError(arg?: boolean): boolean; getError(arg?: boolean): ValidationRuleResult | undefined }];
export interface DefaultState<Schema extends Record<string, any>> {
    schema: SchemaKeys<Schema>[];
    defaultData: Partial<Schema>;
    processField: FieldProcessor<Schema>;
    fieldProblems?: FieldProblems<Schema>;
}
export function init<Schema extends Record<string, any>>({ schema, defaultData, processField, fieldProblems }: DefaultState<Schema>) {
    const getProcessedState = (fieldKey: Extract<keyof Schema, string>) => {
        if (!defaultData[fieldKey]) {
            return { valid: false, errors: null, data: null, fieldProblems: fieldProblems?.[fieldKey] ?? null };
        }

        const [formattedValue, validationResult] = processField(
            { key: fieldKey, value: defaultData[fieldKey], mode: 'blur' },
            { state: { data: defaultData } }
        );

        return {
            valid: (validationResult.isValid && !fieldProblems?.[fieldKey]) || false,
            errors: validationResult.hasError() ? validationResult.getError() : null,
            data: formattedValue,
            fieldProblems: fieldProblems?.[fieldKey] ?? null,
        };
    };

    const formData = schema.reduce<FormState<Schema>>(
        (acc, fieldKey) => {
            const { valid, errors, data, fieldProblems } = getProcessedState(fieldKey);

            return {
                valid: { ...acc.valid, [fieldKey]: valid },
                errors: { ...acc.errors, [fieldKey]: errors },
                data: { ...acc.data, [fieldKey]: data },
                fieldProblems: { ...acc.fieldProblems, [fieldKey]: fieldProblems },
            };
        },
        { data: {}, valid: {}, errors: {}, fieldProblems: {} } as FormState<Schema>
    );

    return {
        schema,
        data: formData.data,
        valid: formData.valid,
        errors: formData.errors,
        fieldProblems: formData.fieldProblems,
    };
}
export function getReducer<FormSchema extends Record<string, any>>(processField: FieldProcessor<FormSchema>) {
    return function reducer(state: FormState<FormSchema>, { type, payload }: ReducerPayloadParams<FormSchema>): FormState<FormSchema> {
        switch (type) {
            case 'setData': {
                return { ...state, data: { ...state.data, [payload.key]: payload.value } };
            }
            case 'setValid': {
                return { ...state, valid: { ...state.valid, [payload.key]: payload.value } };
            }
            case 'setErrors': {
                return { ...state, errors: { ...state.errors, [payload.key]: payload.value } };
            }
            case 'setFieldProblems': {
                return (
                    state.schema?.reduce(
                        (acc: FormState<FormSchema>, key: keyof FormSchema) => ({
                            ...acc,
                            fieldProblems: { ...state['fieldProblems'], [key]: payload.fieldProblems?.[key] ?? null },
                            valid: { ...state['valid'], [key]: state?.valid?.[key] && !payload.fieldProblems?.[key] },
                        }),
                        state
                    ) ?? state
                );
            }
            case 'updateField': {
                const [formattedValue, validation] = processField({ key: payload.key, value: payload.value, mode: payload.mode }, { state });
                const oldValue = state.data[payload.key];
                const fieldProblems = { ...state.fieldProblems };
                if (oldValue !== formattedValue) {
                    fieldProblems[payload.key] = null;
                }
                return {
                    ...state,
                    data: { ...state['data'], [payload.key]: formattedValue },
                    errors: { ...state['errors'], [payload.key]: validation.hasError() ? validation.getError() : null },
                    valid: { ...state['valid'], [payload.key]: (validation.isValid && !fieldProblems[payload.key]) || false },
                    fieldProblems,
                };
            }
            case 'mergeForm': {
                // To provide a uniform result from forms even if there are multiple levels of nested forms are present
                const mergedState = {
                    ...state,
                    data: { ...state['data'], ...payload.formValue['data'] },
                    errors: { ...state['errors'], ...payload.formValue['errors'] },
                    valid: { ...state['valid'], ...payload.formValue['valid'] },
                    fieldProblems: { ...state['fieldProblems'], ...payload.formValue['fieldProblems'] },
                };
                if (mergedState['valid']) {
                    mergedState.isValid = Object.values(mergedState.valid).every(isValid => isValid);
                }
                return mergedState;
            }
            case 'setSchema': {
                const defaultState = init({
                    schema: payload.schema,
                    defaultData: payload.defaultData,
                    processField,
                    fieldProblems: payload.fieldProblems,
                });
                const removedSchemaFields = state.schema?.filter(x => !payload.schema.includes(x)) ?? [];
                const newSchemaFields = payload.schema.filter(x => !state.schema?.includes(x));

                // if we remove a key from the schema we also lost the latest value of the field
                // to prevent this we have to store the value in a local state so we can recover it when the key is re-added to the schema
                const local: Partial<FormState<FormSchema>> = {
                    data: omitKeys(state.data, newSchemaFields) as FormSchema,
                    errors: omitKeys(state.errors, newSchemaFields),
                    valid: omitKeys(state.valid, newSchemaFields) as FormValidField<FormSchema>,
                };

                // reindex data and validation according to the new schema
                const data = addKeys(
                    omitKeys(state.data, removedSchemaFields),
                    newSchemaFields,
                    null,
                    defaultState.data,
                    state.local?.data
                ) as FormSchema;
                const valid = addKeys(
                    omitKeys(state.valid, removedSchemaFields),
                    newSchemaFields,
                    false,
                    defaultState.valid,
                    state.local?.valid
                ) as FormValidField<FormSchema>;
                const errors = addKeys(omitKeys(state.errors, removedSchemaFields), newSchemaFields, null, defaultState.errors, state.local?.errors);

                return { ...state, schema: payload.schema, data, valid, errors, local };
            }
            case 'validateForm': {
                const validationSchema = payload.selectedSchema || state?.schema || [];

                const formValidation = validationSchema.reduce(
                    (acc, cur) => {
                        const [, validation] = processField({ key: cur, value: state.data[cur], mode: 'blur' }, { state });
                        return {
                            valid: { ...acc['valid'], [cur]: (validation.isValid && !state.fieldProblems?.[cur]) || false },
                            errors: { ...acc['errors'], [cur]: validation.hasError(true) ? validation.getError(true) : null },
                        };
                    },
                    { valid: state.valid, errors: state.errors }
                );

                return { ...state, valid: formValidation.valid, errors: formValidation.errors };
            }
            default:
                throw new Error('Undefined useForm action');
        }
    };
}

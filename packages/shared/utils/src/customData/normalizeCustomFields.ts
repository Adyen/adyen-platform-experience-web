import type { CustomColumn } from '@integration-components/types';
import { isFunction } from '../value/is';

type _Fields<Field extends string> = readonly CustomColumn<Field>[];
type _RemappedField<Field extends string> = Field | readonly Field[] | undefined;

export const normalizeCustomFields = <Field extends string, Context>(
    customFields?: _Fields<Field>,
    fieldMappings: Record<string, _RemappedField<Field> | ((context?: Context) => _RemappedField<Field>)> = {},
    context?: Context
) => {
    return customFields?.flatMap(field => {
        if (typeof field === 'object') {
            const fieldName = field?.key?.trim();
            const remappedFieldGetter = fieldName && fieldMappings[fieldName];
            const remappedFieldName = isFunction(remappedFieldGetter) ? remappedFieldGetter(context) : remappedFieldGetter;

            if (remappedFieldName) {
                const remappedFieldNames = Array.isArray(remappedFieldName) ? remappedFieldName : [remappedFieldName];
                return remappedFieldNames.map(key => ({ ...field, key }));
            }
        }
        return [field];
    });
};

export default normalizeCustomFields;

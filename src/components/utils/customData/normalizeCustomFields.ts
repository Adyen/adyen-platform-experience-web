import { isFunction } from '../../../utils';
import type { CustomColumn } from '../../types';

type _Fields<Field extends string> = readonly CustomColumn<Field>[];
type _RemappedField<Field extends string> = Field | undefined;

export const normalizeCustomFields = <Field extends string, Context>(
    customFields?: _Fields<Field>,
    fieldMappings: Record<string, _RemappedField<Field> | ((context?: Context) => _RemappedField<Field>)> = {},
    context?: Context
) => {
    return customFields?.map(field => {
        if (typeof field === 'object') {
            const fieldName = field?.key?.trim();
            const remappedFieldGetter = fieldName && fieldMappings[fieldName];
            const remappedFieldName = isFunction(remappedFieldGetter) ? remappedFieldGetter(context) : remappedFieldGetter;
            if (remappedFieldName) return { ...field, key: remappedFieldName };
        }
        return field;
    });
};

export default normalizeCustomFields;

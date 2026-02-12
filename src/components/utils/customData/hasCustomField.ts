import { EMPTY_ARRAY } from '../../../utils';
import type { CustomColumn } from '../../types';

type _Fields<Field extends string> = readonly CustomColumn<Field>[];

export const hasCustomField = <Field extends string, StandardFields extends readonly string[] = string[]>(
    preferredFields?: _Fields<Field>,
    standardFields = EMPTY_ARRAY as unknown as StandardFields
) => {
    if (Array.isArray(preferredFields)) {
        for (const field of preferredFields) {
            try {
                // Normalize the field to determine its name (without any leading or trailing whitespaces)
                const fieldName = typeof field === 'object' ? field?.key?.trim() : false;

                if (
                    // `fieldName` is expected to be a string (except in a case of misconfiguration)
                    typeof fieldName === 'string' &&
                    // `fieldName` should not be an empty string (except in a case of misconfiguration)
                    fieldName &&
                    // `field` is a custom field if `fieldName` is not in the `standardFields` list
                    !standardFields.includes(fieldName as StandardFields[number])
                ) {
                    return true;
                }
            } catch (ex) {
                // An exception will only be thrown if there is some misconfiguration of the preferred field.
                // Only log the exception to console if not in production environment (vite).
                if (!import.meta.env.PROD) console.error(ex);
            }
        }
    }
    return false;
};

export default hasCustomField;

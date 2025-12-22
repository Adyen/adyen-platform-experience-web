import { ThemeFormDataFields } from '../../PayByLinkThemeContainer/types';
import { IPayByLinkTheme } from '../../../../../../../types';

const cloneFormData = (formData: FormData) => {
    const formDataClone = new FormData();
    for (const [field, value] of formData.entries()) {
        if (value instanceof File) {
            formDataClone.set(field, value, value.name);
        } else formDataClone.set(field, value);
    }
    return formDataClone;
};

export const setFormData = (previousPaylod: FormData | null, fieldName: ThemeFormDataFields, data: string) => {
    const nextFormData = previousPaylod ? cloneFormData(previousPaylod) : new FormData();
    nextFormData.set(fieldName, data!);
    return nextFormData;
};

export const getThemePayload = (theme: IPayByLinkTheme) => {
    const initialKeys = Object.keys(theme) as ThemeFormDataFields[];
    if (initialKeys.length === 0) return;
    const initialPayload: FormData = initialKeys?.reduce((prevPayload: FormData | null, currentValue) => {
        const field = currentValue as ThemeFormDataFields;
        const fieldValue = theme?.[field];
        if (fieldValue) {
            return setFormData(prevPayload, field, fieldValue);
        }
        return prevPayload;
    }, null) as unknown as FormData;
    return initialPayload;
};

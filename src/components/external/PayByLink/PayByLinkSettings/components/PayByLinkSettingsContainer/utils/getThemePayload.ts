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

export const getThemePayload = (theme: IPayByLinkTheme): FormData => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(theme)) {
        if (value) {
            formData.set(key, value);
        }
    }
    return formData;
};

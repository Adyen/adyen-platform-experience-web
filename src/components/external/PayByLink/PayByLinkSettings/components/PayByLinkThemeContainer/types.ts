import { IPayByLinkTermsAndConditions } from '../../../../../../types';
import { PayByLinkSettingsData, PayByLinkSettingsPayload, ThemeFormData } from '../PayByLinkSettingsContainer/context/types';
import { hasOwnProperty } from '../../../../../../utils';

export type LogoTypes = 'logo' | 'fullWidthLogo';

export interface ThemeFormProps {
    theme: ThemeFormData;
    initialPayload?: FormData;
}

export const ThemeFormDataRequest = {
    BRAND: 'brandName',
    LOGO: 'logo',
    FULL_WIDTH_LOGO: 'fullWidthLogo',
};

export const isTermsAndConditionsData = (data: PayByLinkSettingsData): data is IPayByLinkTermsAndConditions => {
    const dataObj = typeof data === 'object' ? data : {};
    return hasOwnProperty(dataObj, 'termsOfServiceUrl');
};

export const isThemeData = (data: PayByLinkSettingsData): data is ThemeFormData => {
    const dataObj = typeof data === 'object' ? data : {};
    return hasOwnProperty(dataObj, 'brandName');
};

export const isThemePayload = (data: PayByLinkSettingsPayload): data is FormData => {
    return data instanceof FormData;
};

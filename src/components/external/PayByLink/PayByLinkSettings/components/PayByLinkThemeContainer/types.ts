import { IPayByLinkTermsAndConditions, IPayByLinkTheme } from '../../../../../../types';
import { PayByLinkSettingsData } from '../PayByLinkSettingsContainer/context/types';
import { hasOwnProperty } from '../../../../../../utils';

export type LogoTypes = 'logo' | 'fullWidthLogo';

export interface ThemeFormProps {
    theme: IPayByLinkTheme;
    initialPayload?: FormData;
}

export const ThemeFormDataRequest = {
    BRAND: 'brandName',
    LOGO: 'logo',
    FULL_WIDTH_LOGO: 'fullWidthLogo',
};

export type ThemeFormDataFields = keyof IPayByLinkTheme;

export const isTermsAndConditionsData = (data: PayByLinkSettingsData): data is IPayByLinkTermsAndConditions => {
    const dataObj = typeof data === 'object' ? data : {};
    const keys = Object.keys(dataObj);
    return hasOwnProperty(data, 'termsOfServiceUrl') || keys.length === 0;
};

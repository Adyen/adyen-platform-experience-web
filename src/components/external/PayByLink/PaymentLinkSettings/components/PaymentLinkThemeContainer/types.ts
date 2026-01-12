import { IPaymentLinkTermsAndConditions } from '../../../../../../types';
import { PaymentLinkSettingsData, PaymentLinkSettingsPayload, ThemeFormData } from '../PaymentLinkSettingsContainer/context/types';
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

export const isTermsAndConditionsData = (data: PaymentLinkSettingsData): data is IPaymentLinkTermsAndConditions => {
    const dataObj = typeof data === 'object' ? data : {};
    return hasOwnProperty(dataObj, 'termsOfServiceUrl');
};

export const isThemeData = (data: PaymentLinkSettingsData): data is ThemeFormData => {
    const dataObj = typeof data === 'object' ? data : {};
    return hasOwnProperty(dataObj, 'brandName');
};

export const isThemePayload = (data: PaymentLinkSettingsPayload): data is FormData => {
    return data instanceof FormData;
};

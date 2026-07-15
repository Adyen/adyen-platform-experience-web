import { hasOwnProperty } from '@integration-components/utils';
import type { IPaymentLinkTermsAndConditions } from '@integration-components/types';
import type { PaymentLinkSettingsData, PaymentLinkSettingsPayload, ThemeFormData } from '../types';

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

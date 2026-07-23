import type { LogoType, ThemeFormData } from '@integration-components/payByLink/domain';

export type LogoTypes = LogoType;

export interface ThemeFormProps {
    theme: ThemeFormData;
    initialPayload?: FormData;
}

export { ThemeFormDataRequest, isTermsAndConditionsData, isThemeData, isThemePayload } from '@integration-components/payByLink/domain';

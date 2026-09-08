import type { AdyenPlatformExperienceError } from '@integration-components/core';
import type { V2TranslationKey } from '@integration-components/core/vue';
import { ACCOUNT_MISCONFIGURATION, PERMISSION_ERROR, WRONG_STORE_IDS } from '../constants';

type SettingsErrorContent = {
    title: V2TranslationKey;
    messages: V2TranslationKey[];
    refreshComponent: boolean;
};

export const getSettingsErrorMessage = (
    error: AdyenPlatformExperienceError | undefined,
    errorMessage: V2TranslationKey,
    onContactSupport?: () => void
): SettingsErrorContent | undefined => {
    if (!error) return undefined;

    const secondaryErrorMessage: V2TranslationKey = onContactSupport
        ? 'payByLink.common.errors.errorCode'
        : 'payByLink.common.errors.errorCodeSupport';

    switch (error.errorCode) {
        case ACCOUNT_MISCONFIGURATION:
            return {
                title: 'payByLink.common.errors.somethingWentWrong',
                messages: ['payByLink.common.errors.accountConfiguration', 'payByLink.common.errors.contactSupport'],
                refreshComponent: false,
            };
        case WRONG_STORE_IDS:
            return {
                title: 'payByLink.common.errors.somethingWentWrong',
                messages: ['payByLink.common.errors.storeID', 'payByLink.common.errors.contactSupport'],
                refreshComponent: false,
            };
        case PERMISSION_ERROR:
            return {
                title: 'payByLink.common.errors.somethingWentWrong',
                messages: [errorMessage],
                refreshComponent: false,
            };
        case '00_500':
        default:
            return {
                title: 'payByLink.common.errors.somethingWentWrong',
                messages: [errorMessage, secondaryErrorMessage],
                refreshComponent: true,
            };
    }
};

export default getSettingsErrorMessage;

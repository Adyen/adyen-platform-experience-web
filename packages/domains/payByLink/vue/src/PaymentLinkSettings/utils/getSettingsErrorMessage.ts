import type { AdyenPlatformExperienceError, TranslationKey } from '@integration-components/core';
import type { SettingsErrorContent } from '../types';
import { ACCOUNT_MISCONFIGURATION, PERMISSION_ERROR, WRONG_STORE_IDS } from '../constants';

export const getSettingsErrorMessage = (
    error: AdyenPlatformExperienceError | undefined,
    errorMessage: TranslationKey,
    onContactSupport?: () => void
): SettingsErrorContent | undefined => {
    if (!error) return undefined;

    const secondaryErrorMessage: TranslationKey = onContactSupport ? 'common.errors.errorCode' : 'common.errors.errorCodeSupport';

    switch (error.errorCode) {
        case ACCOUNT_MISCONFIGURATION:
            return {
                title: 'common.errors.somethingWentWrong',
                messages: ['payByLink.common.errors.accountConfiguration', 'common.errors.contactSupport'],
                refreshComponent: false,
            };
        case WRONG_STORE_IDS:
            return {
                title: 'common.errors.somethingWentWrong',
                messages: ['payByLink.common.errors.storeID', 'common.errors.contactSupport'],
                refreshComponent: false,
            };
        case PERMISSION_ERROR:
            return {
                title: 'common.errors.somethingWentWrong',
                messages: [errorMessage],
                refreshComponent: false,
            };
        case '00_500':
        default:
            return {
                title: 'common.errors.somethingWentWrong',
                messages: [errorMessage, secondaryErrorMessage],
                refreshComponent: true,
            };
    }
};

export default getSettingsErrorMessage;

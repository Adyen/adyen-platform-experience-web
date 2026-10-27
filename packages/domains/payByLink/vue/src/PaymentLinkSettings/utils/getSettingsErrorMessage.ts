import type { AdyenPlatformExperienceError } from '@integration-components/core';
import type { PayByLinkTranslationKey } from '@integration-components/payByLink/domain';
import { ACCOUNT_MISCONFIGURATION, PERMISSION_ERROR, WRONG_STORE_IDS } from '../constants';

type SettingsErrorContent = {
    title: PayByLinkTranslationKey;
    messages: PayByLinkTranslationKey[];
    refreshComponent: boolean;
};

export const getSettingsErrorMessage = (
    error: AdyenPlatformExperienceError | undefined,
    errorMessage: PayByLinkTranslationKey,
    onContactSupport?: () => void
): SettingsErrorContent | undefined => {
    if (!error) return undefined;

    const secondaryErrorMessage: PayByLinkTranslationKey = onContactSupport
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

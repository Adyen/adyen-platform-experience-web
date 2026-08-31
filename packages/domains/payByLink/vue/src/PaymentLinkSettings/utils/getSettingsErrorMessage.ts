import type { AdyenPlatformExperienceError } from '@integration-components/core';
import type { PayByLinkTranslationKey } from '@integration-components/payByLink/domain';
import { ACCOUNT_MISCONFIGURATION, PERMISSION_ERROR, WRONG_STORE_IDS } from '../constants';

export type SettingsErrorContent = Readonly<{
    title: PayByLinkTranslationKey;
    messages: PayByLinkTranslationKey[];
    refreshComponent: boolean;
}>;

export const getSettingsErrorMessage = (
    error: AdyenPlatformExperienceError | undefined,
    errorMessage: PayByLinkTranslationKey,
    onContactSupport?: () => void
): SettingsErrorContent | undefined => {
    if (!error) return undefined;

    const secondaryErrorMessage: PayByLinkTranslationKey = onContactSupport ? 'payByLink.errors.errorCode' : 'payByLink.errors.errorCodeSupport';

    switch (error.errorCode) {
        case ACCOUNT_MISCONFIGURATION:
            return {
                title: 'payByLink.errors.somethingWentWrong',
                messages: ['payByLink.common.errors.accountConfiguration', 'payByLink.errors.contactSupport'],
                refreshComponent: false,
            };
        case WRONG_STORE_IDS:
            return {
                title: 'payByLink.errors.somethingWentWrong',
                messages: ['payByLink.common.errors.storeID', 'payByLink.errors.contactSupport'],
                refreshComponent: false,
            };
        case PERMISSION_ERROR:
            return {
                title: 'payByLink.errors.somethingWentWrong',
                messages: [errorMessage],
                refreshComponent: false,
            };
        case '00_500':
        default:
            return {
                title: 'payByLink.errors.somethingWentWrong',
                messages: [errorMessage, secondaryErrorMessage],
                refreshComponent: true,
            };
    }
};

export default getSettingsErrorMessage;

import { AdyenPlatformExperienceError, type TranslationKey } from '@integration-components/core';
import { ErrorMessage, getCommonErrorMessage } from '@integration-components/ui-components-preact/utils/getCommonErrorCode';

export type CapitalErrorMessage = Omit<ErrorMessage, 'translationValues'> & {
    translationValues?: { [key in TranslationKey]?: string };
};

export const COMMON_CAPITAL_ERROR_MESSAGE = {
    contactSupportForHelp: 'common.errors.contactSupport',
    couldNotLoadOffers: 'capital.offer.common.errors.unavailable',
    tryRefreshingThePage: 'common.errors.retry',
    somethingWentWrong: 'common.errors.somethingWentWrong',
} as const;

const UNKNOWN_ERROR: CapitalErrorMessage = {
    title: COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong,
    message: [COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, COMMON_CAPITAL_ERROR_MESSAGE.tryRefreshingThePage],
    refreshComponent: true,
};

export const getCapitalErrorMessage = (error: AdyenPlatformExperienceError | undefined, onContactSupport?: () => void): CapitalErrorMessage => {
    if (!error) return UNKNOWN_ERROR;

    const commonErrorMessage = getCommonErrorMessage(error, onContactSupport);
    if (commonErrorMessage) {
        const { translationValues: _translationValues, ...errorMessage } = commonErrorMessage;
        return errorMessage;
    }

    const errorCodeMessage = onContactSupport ? 'common.errors.errorCode' : 'common.errors.errorCodeSupport';
    const translationValues = error.requestId ? { [errorCodeMessage]: error.requestId } : undefined;

    switch (error.errorCode) {
        case '30_016':
            return {
                title: COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong,
                message: [COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, errorCodeMessage],
                translationValues,
                onContactSupport,
            };
        case '30_011':
            return {
                title: 'capital.offer.common.errors.accountInactive',
                message: [COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, errorCodeMessage],
                translationValues,
                onContactSupport,
            };
        case '30_600':
            return {
                title: COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong,
                message: ['capital.offer.common.errors.cannotContinue', errorCodeMessage],
                translationValues,
                onContactSupport,
            };
        case 'NO_OFFER':
            return {
                title: 'capital.offer.common.noOfferTitle',
                message: 'capital.offer.common.noOfferDescription',
            };
        case 'UNSUPPORTED_REGION':
            return {
                title: 'capital.common.errors.unsupportedRegion.title',
                message: 'capital.common.errors.unsupportedRegion',
            };
        case undefined:
            return { ...UNKNOWN_ERROR, ...(onContactSupport ? { onContactSupport } : {}) };
        default:
            return { ...UNKNOWN_ERROR, refreshComponent: true };
    }
};

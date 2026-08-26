import { AdyenErrorResponse, AdyenPlatformExperienceError, type TranslationKey } from '@integration-components/core';

export type CapitalErrorMessage = {
    title: TranslationKey;
    message?: TranslationKey | TranslationKey[];
    refreshComponent?: boolean;
    onContactSupport?: () => void;
    translationValues?: { [key in TranslationKey]?: string };
};

export type CapitalErrorMessageInfo = Omit<CapitalErrorMessage, 'message' | 'translationValues'> & {
    messages: TranslationKey[];
    requestId?: string;
};

export type BalanceAccountErrorMessage = {
    title: TranslationKey;
    message: TranslationKey;
};

const BALANCE_ACCOUNT_ERROR_CODE = '30_013';

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

export const getBalanceAccountErrorMessage = (error: AdyenErrorResponse | undefined): BalanceAccountErrorMessage | undefined => {
    if (!error || error.errorCode !== BALANCE_ACCOUNT_ERROR_CODE) return undefined;

    return {
        title: 'capital.offer.common.errors.noPrimaryAccount',
        message: 'capital.offer.common.errors.cannotContinueSupport',
    };
};

export const getCapitalErrorMessage = (error: AdyenPlatformExperienceError | undefined, onContactSupport?: () => void): CapitalErrorMessage => {
    if (!error) return UNKNOWN_ERROR;
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

export const getCapitalErrorMessageInfo = (
    error: AdyenPlatformExperienceError | undefined,
    onContactSupport?: () => void
): CapitalErrorMessageInfo => {
    const { message, translationValues, ...rest } = getCapitalErrorMessage(error, onContactSupport);
    const messages = message ? (Array.isArray(message) ? message : [message]) : [];
    const requestId = translationValues && Object.values(translationValues)[0];
    return { ...rest, messages, requestId };
};

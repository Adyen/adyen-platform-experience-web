import AdyenPlatformExperienceError from '../../../core/Errors/AdyenPlatformExperienceError';
import { ErrorMessage, getCommonErrorMessage } from '../getCommonErrorCode';

export const COMMON_CAPITAL_ERROR_MESSAGE = {
    contactSupport: 'pleaseContactSupportForHelp',
    couldNotLoadOffers: 'capital.weCouldNotLoadFinancialOffers',
    tryRefreshingThePage: 'tryRefreshingThePageOrComeBackLater',
    somethingWentWrong: 'somethingWentWrong',
} as const;

const UNKNOWN_ERROR = {
    title: COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong,
    message: [COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, COMMON_CAPITAL_ERROR_MESSAGE.tryRefreshingThePage],
    refreshComponent: true,
};

export const getCapitalErrorMessage = (error: AdyenPlatformExperienceError | undefined, onContactSupport?: () => void): ErrorMessage => {
    if (!error) return UNKNOWN_ERROR;
    const commonError = getCommonErrorMessage(error, onContactSupport);
    if (commonError) return commonError;
    switch (error.errorCode) {
        case undefined:
            return { ...UNKNOWN_ERROR, ...(onContactSupport ? { onContactSupport } : {}) };
        case '30_016': {
            return {
                title: COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong,
                message: [COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, COMMON_CAPITAL_ERROR_MESSAGE.contactSupport],
                onContactSupport,
            };
        }
        case '30_011': {
            return {
                title: 'capital.accountIsInactive',
                message: [COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, COMMON_CAPITAL_ERROR_MESSAGE.contactSupport],
                onContactSupport,
            };
        }
        case '30_600': {
            return {
                title: COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong,
                message: ['capital.weCouldNotContinueWithTheOffer'],
                onContactSupport,
            };
        }
        case 'EMPTY_CONFIG': {
            return {
                title: COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong,
                message: ['capital.weCouldNotContinueWithTheOffer'],
            };
        }
        default:
            return { ...UNKNOWN_ERROR, refreshComponent: true };
    }
};

import AdyenPlatformExperienceError from '../../../core/Errors/AdyenPlatformExperienceError';
import { ErrorMessage, getCommonErrorMessage } from '../getCommonErrorCode';

export const COMMON_CAPITAL_ERROR_MESSAGE = {
    contactSupport: 'capital.pleaseContactSupportForHelp',
    couldNotLoadOffers: 'capital.couldNotContinueWithTheOffer',
    tryRefreshingThePage: 'capital.tryRefreshingThePageOrComeBackLater',
    somethingWentWrong: 'capital.somethingWentWrong',
} as const;

const UNKNOWN_ERROR = {
    title: COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong,
    message: [COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, COMMON_CAPITAL_ERROR_MESSAGE.tryRefreshingThePage],
};

export const getCapitalErrorMessage = (error: AdyenPlatformExperienceError | undefined, onContactSupport?: () => void): ErrorMessage => {
    if (!error) return UNKNOWN_ERROR;
    const commonError = getCommonErrorMessage(error, onContactSupport);
    if (commonError) return commonError;
    switch (error.errorCode) {
        case undefined:
            return { ...UNKNOWN_ERROR, ...(onContactSupport ? { onContactSupport } : { refreshComponent: true }) };
        case '30_016': {
            return {
                title: COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong,
                message: [COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, COMMON_CAPITAL_ERROR_MESSAGE.contactSupport],
                onContactSupport,
            };
        }
        case '30_011': {
            return {
                title: 'capital.accountIsNotActive',
                message: [COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, COMMON_CAPITAL_ERROR_MESSAGE.contactSupport],
                onContactSupport,
            };
        }
        case '30_600': {
            return {
                title: COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong,
                message: ['capital.couldNotContinueWithTheOffer', COMMON_CAPITAL_ERROR_MESSAGE.contactSupport],
                onContactSupport,
            };
        }
        default:
            return { ...UNKNOWN_ERROR, refreshComponent: true };
    }
};

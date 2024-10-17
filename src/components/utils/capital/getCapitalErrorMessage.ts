import AdyenPlatformExperienceError from '../../../core/Errors/AdyenPlatformExperienceError';
import { ErrorMessage, getCommonErrorMessage, UNDEFINED_ERROR } from '../getCommonErrorCode';

export const COMMON_CAPITAL_ERROR_MESSAGE = {
    contactSupport: 'capital.pleaseContactSupportForHelp',
    couldNotLoadOffers: 'capital.couldNotLoadFinancialOffers',
    tryRefreshingThePage: 'capital.tryRefreshingThePageOrComeBackLater',
    somethingWentWrong: 'capital.somethingWentWrong',
} as const;

export const getCapitalErrorMessage = (error: AdyenPlatformExperienceError | undefined, onContactSupport?: () => void): ErrorMessage => {
    if (!error) return UNDEFINED_ERROR;
    const commonError = getCommonErrorMessage(error, onContactSupport);
    if (commonError) return commonError;
    switch (error.errorCode) {
        case undefined:
            return {
                ...UNDEFINED_ERROR,
                refreshComponent: true,
            };
        case '01_0422': {
            return {
                title: COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong,
                message: [COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, COMMON_CAPITAL_ERROR_MESSAGE.contactSupport],
                onContactSupport,
            };
        }
        case '02_0422': {
            return {
                title: 'capital.accountIsNotActive',
                message: [COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, COMMON_CAPITAL_ERROR_MESSAGE.contactSupport],
                onContactSupport,
            };
        }
        case '03_0422': {
            return {
                title: COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong,
                message: [COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, COMMON_CAPITAL_ERROR_MESSAGE.tryRefreshingThePage],
                onContactSupport,
            };
        }
        case '04_0422': {
            return {
                title: COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong,
                message: ['capital.couldNotContinueWithTheOffer', COMMON_CAPITAL_ERROR_MESSAGE.contactSupport],
                onContactSupport,
            };
        }
        default:
            return UNDEFINED_ERROR;
    }
};

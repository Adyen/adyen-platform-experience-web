import AdyenPlatformExperienceError from '../../../core/Errors/AdyenPlatformExperienceError';
import { ErrorMessage, getCommonErrorMessage } from '../getCommonErrorCode';
import CopyText from '../../internal/CopyText/CopyText';

export const COMMON_CAPITAL_ERROR_MESSAGE = {
    contactSupportForHelp: 'contactSupportForHelp',
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

    const errorCodeMessage = onContactSupport ? 'theErrorCodeIs' : 'contactSupportForHelpAndShareErrorCode';

    switch (error.errorCode) {
        case undefined:
            return { ...UNKNOWN_ERROR, ...(onContactSupport ? { onContactSupport } : {}) };
        case '30_016': {
            return {
                title: COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong,
                message: [COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, errorCodeMessage],
                translationValues: {
                    [errorCodeMessage]: error.requestId ? <CopyText textToCopy={error.requestId} /> : null,
                },
                onContactSupport,
            };
        }
        case '30_011': {
            return {
                title: 'capital.accountIsInactive',
                message: [COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, errorCodeMessage],
                translationValues: {
                    [errorCodeMessage]: error.requestId ? <CopyText textToCopy={error.requestId} /> : null,
                },
                onContactSupport,
            };
        }
        case '30_600': {
            return {
                title: COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong,
                message: ['capital.weCouldNotContinueWithTheOffer', errorCodeMessage],
                translationValues: {
                    [errorCodeMessage]: error.requestId ? <CopyText textToCopy={error.requestId} /> : null,
                },
                onContactSupport,
            };
        }
        case 'EMPTY_CONFIG': {
            return {
                title: COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong,
                message: ['capital.weCouldNotContinueWithTheOffer', COMMON_CAPITAL_ERROR_MESSAGE.contactSupportForHelp],
            };
        }
        case 'UNSUPPORTED_REGION': {
            return {
                title: 'capital.unsupportedRegionTitle',
                message: 'capital.unsupportedRegionDescription',
            };
        }
        default:
            return { ...UNKNOWN_ERROR, refreshComponent: true };
    }
};

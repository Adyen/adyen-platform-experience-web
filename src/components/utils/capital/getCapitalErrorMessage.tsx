import AdyenPlatformExperienceError from '../../../core/Errors/AdyenPlatformExperienceError';
import { ErrorMessage, getCommonErrorMessage } from '../getCommonErrorCode';
import CopyText from '../../internal/CopyText/CopyText';

export const COMMON_CAPITAL_ERROR_MESSAGE = {
    contactSupportForHelp: 'common.errors.contactSupport',
    couldNotLoadOffers: 'capital.offer.common.errors.unavailable',
    tryRefreshingThePage: 'common.errors.retry',
    somethingWentWrong: 'common.errors.somethingWentWrong',
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

    const errorCodeMessage = onContactSupport ? 'common.errors.errorCode' : 'common.errors.errorCodeSupport';

    switch (error.errorCode) {
        case undefined:
            return { ...UNKNOWN_ERROR, ...(onContactSupport ? { onContactSupport } : {}) };
        case '30_016': {
            return {
                title: COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong,
                message: [COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, errorCodeMessage],
                translationValues: {
                    [errorCodeMessage]: error.requestId ? (
                        <CopyText isUnderlineVisible copyButtonAriaLabelKey="common.actions.copy.labels.errorCode" textToCopy={error.requestId} />
                    ) : null,
                },
                onContactSupport,
            };
        }
        case '30_011': {
            return {
                title: 'capital.offer.common.errors.accountInactive',
                message: [COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, errorCodeMessage],
                translationValues: {
                    [errorCodeMessage]: error.requestId ? (
                        <CopyText isUnderlineVisible copyButtonAriaLabelKey="common.actions.copy.labels.errorCode" textToCopy={error.requestId} />
                    ) : null,
                },
                onContactSupport,
            };
        }
        case '30_600': {
            return {
                title: COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong,
                message: ['capital.offer.common.errors.cannotContinue', errorCodeMessage],
                translationValues: {
                    [errorCodeMessage]: error.requestId ? (
                        <CopyText isUnderlineVisible copyButtonAriaLabelKey="common.actions.copy.labels.errorCode" textToCopy={error.requestId} />
                    ) : null,
                },
                onContactSupport,
            };
        }
        case 'EMPTY_CONFIG': {
            return {
                title: COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong,
                message: ['capital.offer.common.errors.cannotContinue', COMMON_CAPITAL_ERROR_MESSAGE.contactSupportForHelp],
            };
        }
        case 'UNSUPPORTED_REGION': {
            return {
                title: 'capital.common.errors.unsupportedRegion.title',
                message: 'capital.common.errors.unsupportedRegion',
            };
        }
        default:
            return { ...UNKNOWN_ERROR, refreshComponent: true };
    }
};

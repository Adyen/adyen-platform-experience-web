import { ErrorMessage, getCommonErrorMessage, UNDEFINED_ERROR } from './getCommonErrorCode';
import AdyenPlatformExperienceError from '../../core/Errors/AdyenPlatformExperienceError';
import CopyText from '../internal/CopyText/CopyText';
import { TranslationKey } from '../../core/Localization/types';

export const getErrorMessage = (
    error: AdyenPlatformExperienceError | undefined,
    errorMessage: TranslationKey,
    onContactSupport?: () => void
): ErrorMessage => {
    if (!error) return UNDEFINED_ERROR;
    const commonError = getCommonErrorMessage(error, onContactSupport);
    if (commonError) return commonError;
    switch (error.errorCode) {
        case undefined:
            return {
                title: 'somethingWentWrong',
                message: [errorMessage, 'tryRefreshingThePageOrComeBackLater'],
                refreshComponent: true,
            };
        case '00_500':
            return {
                title: 'somethingWentWrong',
                message: onContactSupport
                    ? [errorMessage, 'theErrorCodeIs']
                    : ['weCouldNotLoadYourPayouts', 'contactSupportForHelpAndShareErrorCode'],
                onContactSupport,
                translationValues: onContactSupport
                    ? { theErrorCodeIs: error?.requestId ? <CopyText text={error.requestId} /> : null }
                    : { contactSupportForHelpAndShareErrorCode: error.requestId ? <CopyText text={error.requestId} /> : null },
            };
        default:
            return UNDEFINED_ERROR;
    }
};

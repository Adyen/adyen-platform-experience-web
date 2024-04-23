import { ErrorMessage, getCommonErrorMessages, UNDEFINED_ERROR } from '@src/components/utils/commonErrorCodes';
import AdyenPlatformExperienceError from '@src/core/Errors/AdyenPlatformExperienceError';
import CopyText from '@src/components/internal/CopyText/CopyText';
import { TranslationKey } from '@src/core/Localization/types';

export const getErrorMessage = (
    error: AdyenPlatformExperienceError | undefined,
    errorMessage: TranslationKey,
    onContactSupport?: () => void
): ErrorMessage => {
    if (!error) return UNDEFINED_ERROR;
    const commonErrors = getCommonErrorMessages(error, onContactSupport);
    if (commonErrors) return commonErrors;
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

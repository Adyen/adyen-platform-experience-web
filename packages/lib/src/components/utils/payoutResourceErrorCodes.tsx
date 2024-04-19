import { ErrorMessage, getCommonErrorMessages, UNDEFINED_ERROR } from '@src/components/utils/commonErrorCodes';
import AdyenPlatformExperienceError from '@src/core/Errors/AdyenPlatformExperienceError';
import CopyText from '@src/components/internal/CopyText/CopyText';

export const getErrorMessage = (error: AdyenPlatformExperienceError | undefined, onContactSupport?: () => void): ErrorMessage => {
    if (!error) return UNDEFINED_ERROR;
    const commonErrors = getCommonErrorMessages(error, onContactSupport);
    if (commonErrors) return commonErrors;
    switch (error.errorCode) {
        case undefined:
            return {
                title: 'somethingWentWrong',
                message: ['weCouldNotLoadYourPayouts', 'tryRefreshingThePageOrComeBackLater'],
                refreshComponent: true,
            };
        case '00_500':
            return {
                title: 'somethingWentWrong',
                message: onContactSupport
                    ? ['weCouldNotLoadYourPayouts', 'theErrorCodeIs']
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

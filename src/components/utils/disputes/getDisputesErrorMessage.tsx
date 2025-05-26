import AdyenPlatformExperienceError from '../../../core/Errors/AdyenPlatformExperienceError';
import { TranslationKey } from '../../../translations';
import { ErrorMessage, UNDEFINED_ERROR } from '../getCommonErrorCode';
import CopyText from '../../internal/CopyText/CopyText';

export const getDisputesErrorMessage = (
    error: AdyenPlatformExperienceError | undefined,
    errorMessage: TranslationKey,
    onContactSupport?: () => void
): ErrorMessage => {
    if (!error) return UNDEFINED_ERROR;

    switch (error.errorCode) {
        case undefined:
            return {
                title: 'somethingWentWrong',
                message: [errorMessage, 'tryRefreshingThePageOrComeBackLater'],
                refreshComponent: true,
            };
        case '00_500': {
            const secondaryErrorMessage = onContactSupport ? 'theErrorCodeIs' : 'contactSupportForHelpAndShareErrorCode';
            return {
                title: 'somethingWentWrong',
                message: [errorMessage, secondaryErrorMessage],
                translationValues: {
                    [secondaryErrorMessage]: error.requestId ? <CopyText textToCopy={error.requestId} /> : null,
                },
                onContactSupport,
            };
        }
        case '30_112':
            return {
                title: 'disputes.entityWasNotFound',
                message: ['disputes.entityWasNotFoundDetail'],
                onContactSupport,
            };
        default:
            return UNDEFINED_ERROR;
    }
};

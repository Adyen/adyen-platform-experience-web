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
                title: 'common.errors.default',
                message: [errorMessage, 'common.errors.retry'],
                refreshComponent: true,
            };
        case '00_500': {
            const secondaryErrorMessage = onContactSupport ? 'common.errors.errorCode' : 'common.errors.errorCodeSupport';
            return {
                title: 'common.errors.default',
                message: [errorMessage, secondaryErrorMessage],
                translationValues: {
                    [secondaryErrorMessage]: error.requestId ? (
                        <CopyText copyButtonAriaLabelKey="disputes.errorDisplay.copyErrorCode" textToCopy={error.requestId} />
                    ) : null,
                },
                onContactSupport,
            };
        }
        case '30_112':
            return {
                title: 'disputes.error.entityWasNotFound',
                message: ['disputes.error.entityWasNotFoundDetail'],
                onContactSupport,
            };
        default:
            return UNDEFINED_ERROR;
    }
};

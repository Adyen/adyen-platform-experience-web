import { ErrorMessage, getCommonErrorMessage, UNDEFINED_ERROR } from './getCommonErrorCode';
import AdyenPlatformExperienceError from '../../core/Errors/AdyenPlatformExperienceError';
import CopyText from '../internal/CopyText/CopyText';
import { TranslationKey } from '../../translations';

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
                title: 'common.errors.somethingWentWrong',
                message: [errorMessage, 'common.errors.retry'],
                refreshComponent: true,
            };
        case '00_500': {
            const secondaryErrorMessage = onContactSupport ? 'common.errors.errorCode' : 'common.errors.errorCodeSupport';
            return {
                title: 'common.errors.somethingWentWrong',
                message: [errorMessage, secondaryErrorMessage],
                translationValues: {
                    [secondaryErrorMessage]: error.requestId ? (
                        <CopyText copyButtonAriaLabelKey="common.actions.copy.labels.errorCode" textToCopy={error.requestId} />
                    ) : null,
                },
                onContactSupport,
            };
        }
        default:
            return UNDEFINED_ERROR;
    }
};

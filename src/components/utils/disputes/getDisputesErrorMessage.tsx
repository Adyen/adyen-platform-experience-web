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
                        <CopyText isUnderlineVisible copyButtonAriaLabelKey="common.actions.copy.labels.errorCode" textToCopy={error.requestId} />
                    ) : null,
                },
                onContactSupport,
            };
        }
        case '30_112':
            return {
                title: 'common.errors.notFound',
                message: ['disputes.management.common.errors.notFound'],
                onContactSupport,
            };
        default:
            return UNDEFINED_ERROR;
    }
};

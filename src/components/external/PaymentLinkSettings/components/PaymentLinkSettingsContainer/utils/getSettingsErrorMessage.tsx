import AdyenPlatformExperienceError from '../../../../../../core/Errors/AdyenPlatformExperienceError';
import { TranslationKey } from '../../../../../../translations';
import { ErrorMessage, UNDEFINED_ERROR } from '../../../../../utils/getCommonErrorCode';
import CopyText from '../../../../../internal/CopyText/CopyText';

const getSettingsErrorMessage = (
    error: AdyenPlatformExperienceError | undefined,
    errorMessage: TranslationKey,
    onContactSupport?: () => void
): ErrorMessage => {
    if (!error) return UNDEFINED_ERROR;

    const secondaryErrorMessage = onContactSupport ? 'common.errors.errorCode' : 'common.errors.errorCodeSupport';
    const translationValues = {
        [secondaryErrorMessage]: error.requestId ? (
            <CopyText copyButtonAriaLabelKey="common.actions.copy.labels.errorCode" textToCopy={error.requestId} />
        ) : null,
    };

    switch (error.errorCode) {
        case 'ACCOUNT_MISCONFIGURATION':
            return {
                title: 'common.errors.somethingWentWrong',
                message: ['payByLink.common.errors.accountConfiguration', 'common.errors.contactSupport'],
                translationValues,
            };
        case '00_500':
            return {
                title: 'common.errors.somethingWentWrong',
                message: [errorMessage, secondaryErrorMessage],
                translationValues,
                refreshComponent: true,
            };
        default:
            return {
                title: 'common.errors.somethingWentWrong',
                message: [errorMessage, secondaryErrorMessage],
                translationValues,
                refreshComponent: true,
            };
    }
};

export default getSettingsErrorMessage;

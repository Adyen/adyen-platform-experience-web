import AdyenPlatformExperienceError from '../../../../../../core/Errors/AdyenPlatformExperienceError';
import { TranslationKey } from '../../../../../../translations';
import { ErrorMessage, UNDEFINED_ERROR } from '../../../../../utils/getCommonErrorCode';
import CopyText from '../../../../../internal/CopyText/CopyText';
import { AssetOptions } from '../../../../../../core/Assets/Assets';

const getSettingsErrorMessage = (
    error: AdyenPlatformExperienceError | undefined,
    errorMessage: TranslationKey,
    onContactSupport?: () => void,
    getImageAsset?: (props: AssetOptions) => string
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
        case 'WRONG_STORE_IDS':
            return {
                title: 'common.errors.somethingWentWrong',
                message: ['paymentLinks.common.errors.storeID', 'common.errors.contactSupport'],
                translationValues,
            };
        case '00_500':
            return {
                title: 'common.errors.somethingWentWrong',
                message: [errorMessage, secondaryErrorMessage],
                translationValues,
                refreshComponent: true,
                images: {
                    desktop: getImageAsset?.({ name: 'wrong-environment', subFolder: 'images/small' }),
                },
            };
        default:
            return {
                title: 'common.errors.somethingWentWrong',
                message: [errorMessage, secondaryErrorMessage],
                translationValues,
                refreshComponent: true,
                images: {
                    desktop: getImageAsset?.({ name: 'wrong-environment', subFolder: 'images/small' }),
                },
            };
    }
};

export default getSettingsErrorMessage;

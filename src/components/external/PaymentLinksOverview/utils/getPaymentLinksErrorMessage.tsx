import AdyenPlatformExperienceError from '../../../../core/Errors/AdyenPlatformExperienceError';
import { TranslationKey } from '../../../../translations';
import { ErrorMessage, UNDEFINED_ERROR } from '../../../utils/getCommonErrorCode';
import CopyText from '../../../internal/CopyText/CopyText';
import { AssetOptions } from '../../../../core/Assets/Assets';

export const getPaymentLinksErrorMessage = (
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
                onContactSupport,
            };
        case 'WRONG_STORE_IDS':
            return {
                title: 'common.errors.somethingWentWrong',
                message: ['paymentLinks.common.errors.storeID', 'common.errors.contactSupport'],
                translationValues,
            };
        case '29_001':
            if (error.invalidFields?.some(field => field.name === 'paymentLinkId')) {
                return {
                    title: 'payByLink.overview.errors.listEmpty',
                    message: ['payByLink.overview.errors.listEmpty.message'],
                    images: {
                        desktop: getImageAsset?.({ name: 'no-results-found' }),
                        mobile: getImageAsset?.({ name: 'no-results-found', subFolder: 'images/small' }),
                    },
                };
            }
            return {
                title: 'common.errors.somethingWentWrong',
                message: ['payByLink.overview.errors.couldNotLoadLinks', 'common.errors.retry'],
                onContactSupport,
            };
        case '00_500':
        case undefined:
            return {
                title: 'common.errors.somethingWentWrong',
                message: ['payByLink.overview.errors.couldNotLoadLinks', secondaryErrorMessage],
                translationValues,
                refreshComponent: true,
            };
        default:
            return {
                title: 'common.errors.somethingWentWrong',
                message: [errorMessage, secondaryErrorMessage],
                translationValues,
                onContactSupport,
                refreshComponent: true,
            };
    }
};

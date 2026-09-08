import type { V2TranslationKey } from '@integration-components/core/vue';
import { ACCOUNT_MISCONFIGURATION, WRONG_STORE_IDS } from '@integration-components/payByLink/domain';
import { getPaymentLinksErrorMetadata } from './error';

export type PaymentLinksErrorContent = {
    title: V2TranslationKey;
    messages: V2TranslationKey[];
    requestId?: string;
    imageName?: 'no-results-found' | 'wrong-environment';
    onContactSupport?: () => void;
    refreshComponent?: boolean;
};

export const getPaymentLinksErrorMessage = (
    error: Error | undefined,
    errorMessage: V2TranslationKey,
    onContactSupport?: () => void
): PaymentLinksErrorContent | undefined => {
    if (!error) return undefined;

    const { errorCode, requestId, invalidFields } = getPaymentLinksErrorMetadata(error);
    const secondaryErrorMessage: V2TranslationKey = onContactSupport
        ? 'payByLink.common.errors.errorCode'
        : 'payByLink.common.errors.errorCodeSupport';
    const sharedContent = {
        title: 'payByLink.common.errors.somethingWentWrong' as const,
        requestId,
        imageName: 'wrong-environment' as const,
    };

    switch (errorCode) {
        case ACCOUNT_MISCONFIGURATION:
            return {
                ...sharedContent,
                messages: ['payByLink.common.errors.accountConfiguration', 'payByLink.common.errors.contactSupport'],
                onContactSupport,
            };
        case WRONG_STORE_IDS:
            return {
                ...sharedContent,
                messages: ['payByLink.common.errors.storeID', 'payByLink.common.errors.contactSupport'],
                onContactSupport,
            };
        case '29_001':
            if (invalidFields?.some(field => field.name === 'paymentLinkId')) {
                return {
                    title: 'payByLink.overview.errors.listEmpty',
                    messages: ['payByLink.overview.errors.listEmpty.message'],
                    imageName: 'no-results-found',
                };
            }
            return {
                ...sharedContent,
                messages: ['payByLink.overview.errors.couldNotLoadLinks', 'payByLink.common.errors.retry'],
                onContactSupport,
            };
        case '00_500':
        case undefined:
            return {
                ...sharedContent,
                messages: ['payByLink.overview.errors.couldNotLoadLinks', secondaryErrorMessage],
                refreshComponent: true,
            };
        default:
            return {
                ...sharedContent,
                messages: [errorMessage, secondaryErrorMessage],
                onContactSupport,
                refreshComponent: true,
            };
    }
};

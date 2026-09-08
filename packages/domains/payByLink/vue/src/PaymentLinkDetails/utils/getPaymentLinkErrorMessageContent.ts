import type { V2TranslationKey } from '@integration-components/core/vue';

type ErrorLike = { errorCode?: string; requestId?: string } | undefined;

type PaymentLinkErrorMessageContent = {
    title: V2TranslationKey;
    messages: V2TranslationKey[];
    refreshComponent?: boolean;
    requestId?: string;
};

export const getPaymentLinkErrorMessageContent = (
    error: ErrorLike,
    errorMessage: V2TranslationKey,
    hasContactSupport: boolean
): PaymentLinkErrorMessageContent => {
    if (!error) return { title: 'payByLink.common.errors.unexpected', messages: ['payByLink.common.errors.contactSupport'] };

    switch (error.errorCode) {
        case undefined:
            return {
                title: 'payByLink.common.errors.somethingWentWrong',
                messages: [errorMessage, 'payByLink.common.errors.retry'],
                refreshComponent: true,
            };
        case '500':
            return {
                title: 'payByLink.common.errors.somethingWentWrong',
                messages: [errorMessage, hasContactSupport ? 'payByLink.common.errors.errorCode' : 'payByLink.common.errors.errorCodeSupport'],
                requestId: error.requestId,
            };
        default:
            return { title: 'payByLink.common.errors.unexpected', messages: ['payByLink.common.errors.contactSupport'] };
    }
};

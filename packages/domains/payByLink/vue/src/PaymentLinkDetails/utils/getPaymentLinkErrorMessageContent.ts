import type { PayByLinkTranslationKey } from '@integration-components/payByLink/domain';

type ErrorLike = { errorCode?: string; requestId?: string } | undefined;

export type PaymentLinkErrorMessageContent = Readonly<{
    title: PayByLinkTranslationKey;
    message: PayByLinkTranslationKey[];
    refreshComponent?: boolean;
    requestId?: string;
}>;

/**
 * Domain-keyed counterpart of the shared Preact error-content builder in
 * `payByLink/domain/src/PaymentLinkDetails/utils.ts`. The Vue elements render through the
 * Pay by Link translation catalog, whose keys are scoped under `payByLink.*`.
 */
export const getPaymentLinkErrorMessageContent = (
    error: ErrorLike,
    errorMessage: PayByLinkTranslationKey,
    hasContactSupport: boolean
): PaymentLinkErrorMessageContent => {
    if (!error) return { title: 'payByLink.errors.unexpected', message: ['payByLink.errors.contactSupport'] };

    switch (error.errorCode) {
        case undefined:
            return { title: 'payByLink.errors.somethingWentWrong', message: [errorMessage, 'payByLink.errors.retry'], refreshComponent: true };
        case '500':
            return {
                title: 'payByLink.errors.somethingWentWrong',
                message: [errorMessage, hasContactSupport ? 'payByLink.errors.errorCode' : 'payByLink.errors.errorCodeSupport'],
                requestId: error.requestId,
            };
        default:
            return { title: 'payByLink.errors.unexpected', message: ['payByLink.errors.contactSupport'] };
    }
};

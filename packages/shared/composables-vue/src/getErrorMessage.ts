import { getDomainTranslationKey, type DomainTranslationKey, type TranslationDomain } from '@integration-components/core/vue';

export type ErrorWithCode = Error & { errorCode?: string; requestId?: string };

export type ErrorMessageInfo = {
    title?: DomainTranslationKey;
    messages: DomainTranslationKey[];
    refreshComponent?: boolean;
    onContactSupport?: () => void;
    contactSupportLabel?: DomainTranslationKey;
    requestId?: string;
};

const getCommonErrorMessage = (
    errorCode: string | undefined,
    notFoundMessage: DomainTranslationKey,
    domain: TranslationDomain,
    onContactSupport?: () => void
): ErrorMessageInfo | null => {
    switch (errorCode) {
        case '29_001':
            return {
                title: getDomainTranslationKey(domain, 'common.errors.requestInvalid'),
                messages: [getDomainTranslationKey(domain, 'common.errors.contactSupport')],
                onContactSupport,
            };
        case '30_112':
            return { title: getDomainTranslationKey(domain, 'common.errors.notFound'), messages: [notFoundMessage], onContactSupport };
        case '00_403':
            return {
                title: getDomainTranslationKey(domain, 'common.errors.unexpected'),
                messages: [getDomainTranslationKey(domain, 'common.errors.contactSupport')],
            };
        default:
            return null;
    }
};

export const getErrorMessage = (
    error: ErrorWithCode | undefined,
    errorMessage: DomainTranslationKey,
    domain: TranslationDomain,
    onContactSupport?: () => void,
    notFoundMessage: DomainTranslationKey = errorMessage
): ErrorMessageInfo => {
    if (!error)
        return {
            title: getDomainTranslationKey(domain, 'common.errors.unexpected'),
            messages: [getDomainTranslationKey(domain, 'common.errors.contactSupport')],
        };

    const commonError = getCommonErrorMessage(error.errorCode, notFoundMessage, domain, onContactSupport);
    if (commonError) return commonError;

    switch (error.errorCode) {
        case undefined:
            return {
                title: getDomainTranslationKey(domain, 'common.errors.somethingWentWrong'),
                messages: [errorMessage, getDomainTranslationKey(domain, 'common.errors.retry')],
                refreshComponent: true,
            };
        case '00_500': {
            const errorMessageKey = onContactSupport ? 'common.errors.errorCode' : 'common.errors.errorCodeSupport';
            const secondaryErrorMessage = getDomainTranslationKey(domain, errorMessageKey);
            return {
                title: getDomainTranslationKey(domain, 'common.errors.somethingWentWrong'),
                messages: [errorMessage, secondaryErrorMessage],
                onContactSupport,
                requestId: error.requestId,
            };
        }
        default:
            return {
                title: getDomainTranslationKey(domain, 'common.errors.unexpected'),
                messages: [getDomainTranslationKey(domain, 'common.errors.contactSupport')],
            };
    }
};

export default getErrorMessage;

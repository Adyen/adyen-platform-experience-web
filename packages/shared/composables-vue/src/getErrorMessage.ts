import { getV2TranslationKey, type V2TranslationDomain, type V2TranslationKey } from '@integration-components/core/vue';

export type ErrorWithCode = Error & { errorCode?: string; requestId?: string };

export type ErrorMessageInfo = {
    title?: V2TranslationKey;
    messages: V2TranslationKey[];
    refreshComponent?: boolean;
    onContactSupport?: () => void;
    contactSupportLabel?: V2TranslationKey;
    requestId?: string;
};

const getCommonErrorMessage = (
    errorCode: string | undefined,
    notFoundMessage: V2TranslationKey,
    domain: V2TranslationDomain,
    onContactSupport?: () => void
): ErrorMessageInfo | null => {
    switch (errorCode) {
        case '29_001':
            return {
                title: getV2TranslationKey(domain, 'common.errors.requestInvalid'),
                messages: [getV2TranslationKey(domain, 'common.errors.contactSupport')],
                onContactSupport,
            };
        case '30_112':
            return { title: getV2TranslationKey(domain, 'common.errors.notFound'), messages: [notFoundMessage], onContactSupport };
        case '00_403':
            return {
                title: getV2TranslationKey(domain, 'common.errors.unexpected'),
                messages: [getV2TranslationKey(domain, 'common.errors.contactSupport')],
            };
        default:
            return null;
    }
};

export const getErrorMessage = (
    error: ErrorWithCode | undefined,
    errorMessage: V2TranslationKey,
    domain: V2TranslationDomain,
    onContactSupport?: () => void,
    notFoundMessage: V2TranslationKey = errorMessage
): ErrorMessageInfo => {
    if (!error)
        return {
            title: getV2TranslationKey(domain, 'common.errors.unexpected'),
            messages: [getV2TranslationKey(domain, 'common.errors.contactSupport')],
        };

    const commonError = getCommonErrorMessage(error.errorCode, notFoundMessage, domain, onContactSupport);
    if (commonError) return commonError;

    switch (error.errorCode) {
        case undefined:
            return {
                title: getV2TranslationKey(domain, 'common.errors.somethingWentWrong'),
                messages: [errorMessage, getV2TranslationKey(domain, 'common.errors.retry')],
                refreshComponent: true,
            };
        case '00_500': {
            const errorMessageKey = onContactSupport ? 'common.errors.errorCode' : 'common.errors.errorCodeSupport';
            const secondaryErrorMessage = getV2TranslationKey(domain, errorMessageKey);
            return {
                title: getV2TranslationKey(domain, 'common.errors.somethingWentWrong'),
                messages: [errorMessage, secondaryErrorMessage],
                onContactSupport,
                requestId: error.requestId,
            };
        }
        default:
            return {
                title: getV2TranslationKey(domain, 'common.errors.unexpected'),
                messages: [getV2TranslationKey(domain, 'common.errors.contactSupport')],
            };
    }
};

export default getErrorMessage;

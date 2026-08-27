import type { TranslationKey } from '@integration-components/core';

export type ErrorWithCode = Error & { errorCode?: string; requestId?: string };

export type ErrorMessageInfo = {
    title?: TranslationKey;
    messages: TranslationKey[];
    refreshComponent?: boolean;
    onContactSupport?: () => void;
    contactSupportLabel?: TranslationKey;
    requestId?: string;
};

const UNEXPECTED_ERROR: ErrorMessageInfo = {
    title: 'common.errors.unexpected',
    messages: ['common.errors.contactSupport'],
};

const getCommonErrorMessage = (
    errorCode: string | undefined,
    notFoundMessage: TranslationKey,
    onContactSupport?: () => void
): ErrorMessageInfo | null => {
    switch (errorCode) {
        case '29_001':
            return { title: 'common.errors.requestInvalid', messages: ['common.errors.contactSupport'], onContactSupport };
        case '30_112':
            return { title: 'common.errors.notFound', messages: [notFoundMessage], onContactSupport };
        case '00_403':
            return UNEXPECTED_ERROR;
        default:
            return null;
    }
};

export const getErrorMessage = (
    error: ErrorWithCode | undefined,
    errorMessage: TranslationKey,
    onContactSupport?: () => void,
    notFoundMessage: TranslationKey = errorMessage
): ErrorMessageInfo => {
    if (!error) return UNEXPECTED_ERROR;

    const commonError = getCommonErrorMessage(error.errorCode, notFoundMessage, onContactSupport);
    if (commonError) return commonError;

    switch (error.errorCode) {
        case undefined:
            return {
                title: 'common.errors.somethingWentWrong',
                messages: [errorMessage, 'common.errors.retry'],
                refreshComponent: true,
            };
        case '00_500': {
            const secondaryErrorMessage: TranslationKey = onContactSupport ? 'common.errors.errorCode' : 'common.errors.errorCodeSupport';
            return {
                title: 'common.errors.somethingWentWrong',
                messages: [errorMessage, secondaryErrorMessage],
                onContactSupport,
                requestId: error.requestId,
            };
        }
        default:
            return UNEXPECTED_ERROR;
    }
};

export default getErrorMessage;

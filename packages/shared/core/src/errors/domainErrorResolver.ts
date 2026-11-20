import type { DomainTranslationKey } from '../translations';

export type ErrorWithCode = Error & { errorCode?: string; requestId?: string };

export type ErrorMessageInfo = {
    title?: DomainTranslationKey;
    messages: DomainTranslationKey[];
    refreshComponent?: boolean;
    onContactSupport?: () => void;
    contactSupportLabel?: DomainTranslationKey;
    requestId?: string;
};

/**
 * The error copy a domain lends to the shared `errorCode` dispatch below. Each domain spells its
 * own keys out, so a renamed or missing key fails to compile rather than rendering as key text.
 */
export type DomainErrorVocabulary<K extends DomainTranslationKey = DomainTranslationKey> = {
    contactSupport: K;
    errorCode: K;
    errorCodeSupport: K;
    notFound: K;
    requestInvalid: K;
    retry: K;
    somethingWentWrong: K;
    unexpected: K;
};

export type DomainErrorContext<K extends DomainTranslationKey = DomainTranslationKey> = {
    /** Describes what the component failed to load, so it is specific to the calling component. */
    errorMessage: K;
    notFoundMessage?: K;
    onContactSupport?: () => void;
};

/**
 * Builds a domain's error resolver. The `errorCode` dispatch is shared because it is platform-wide,
 * while the copy stays with the domain that owns it. A domain whose errors do not follow these codes
 * writes its own resolver instead; see capital's `getCapitalErrorConfig`.
 */
export const createDomainErrorResolver =
    <K extends DomainTranslationKey = DomainTranslationKey>(vocabulary: DomainErrorVocabulary<NoInfer<K>>) =>
    (error: ErrorWithCode | undefined, context: DomainErrorContext<K>): ErrorMessageInfo => {
        const { errorMessage, notFoundMessage = errorMessage, onContactSupport } = context;

        if (!error) return { title: vocabulary.unexpected, messages: [vocabulary.contactSupport] };

        switch (error.errorCode) {
            case '29_001':
                return { title: vocabulary.requestInvalid, messages: [vocabulary.contactSupport], onContactSupport };
            case '30_112':
                return { title: vocabulary.notFound, messages: [notFoundMessage], onContactSupport };
            case '00_403':
                return { title: vocabulary.unexpected, messages: [vocabulary.contactSupport] };
            case undefined:
                return { title: vocabulary.somethingWentWrong, messages: [errorMessage, vocabulary.retry], refreshComponent: true };
            case '00_500':
                return {
                    title: vocabulary.somethingWentWrong,
                    messages: [errorMessage, onContactSupport ? vocabulary.errorCode : vocabulary.errorCodeSupport],
                    onContactSupport,
                    requestId: error.requestId,
                };
            default:
                return { title: vocabulary.unexpected, messages: [vocabulary.contactSupport] };
        }
    };

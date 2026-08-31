export type ErrorWithCode = Error & { errorCode?: string; requestId?: string };

/**
 * Error-content keys the portable overview helpers need from the embedding domain.
 * Domain-local translation names are opaque to portable code, so every domain supplies
 * its own catalog keys for the shared error composition instead of the helpers hardcoding
 * a cross-domain namespace.
 */
export type ErrorMessageKeys<DomainKey extends string = string> = Readonly<{
    contactSupport: DomainKey;
    errorCode: DomainKey;
    errorCodeSupport: DomainKey;
    notFound: DomainKey;
    requestInvalid: DomainKey;
    retry: DomainKey;
    somethingWentWrong: DomainKey;
    unexpected: DomainKey;
}>;

export type ErrorMessageKey<Key extends string = string> = Key;

export type ErrorMessageInfo<Key extends string = string> = {
    title?: Key;
    messages: Key[];
    refreshComponent?: boolean;
    onContactSupport?: () => void;
    contactSupportLabel?: Key;
    requestId?: string;
};

export type ErrorMessageParams<Key extends string = string> = Readonly<{
    /** The failed request's error, if any. */
    error: ErrorWithCode | undefined;
    /** Domain-owned catalog keys for the shared error compositions. */
    keys: ErrorMessageKeys<Key>;
    /** Primary domain copy naming the operation that failed. */
    message: ErrorMessageKey<Key>;
    /** Copy shown for a not-found resource. Defaults to `message`. */
    notFoundMessage?: ErrorMessageKey<Key>;
    /** Invoked when the rendered error offers a contact-support action. */
    onContactSupport?: () => void;
}>;

const getCommonErrorCodeMessage = <Key extends string>(
    errorCode: string | undefined,
    keys: ErrorMessageKeys<Key>,
    notFoundMessage: ErrorMessageKey<Key>,
    onContactSupport?: () => void
): ErrorMessageInfo<Key> | null => {
    switch (errorCode) {
        case '29_001':
            return { title: keys.requestInvalid, messages: [keys.contactSupport], onContactSupport };
        case '30_112':
            return { title: keys.notFound, messages: [notFoundMessage], onContactSupport };
        case '00_403':
            return { title: keys.unexpected, messages: [keys.contactSupport] };
        default:
            return null;
    }
};

export const getErrorMessage = <Key extends string>({
    error,
    keys,
    message,
    notFoundMessage = message,
    onContactSupport,
}: ErrorMessageParams<Key>): ErrorMessageInfo<Key> => {
    const unexpectedError: ErrorMessageInfo<Key> = { title: keys.unexpected, messages: [keys.contactSupport] };
    if (!error) return unexpectedError;

    const commonError = getCommonErrorCodeMessage(error.errorCode, keys, notFoundMessage, onContactSupport);
    if (commonError) return commonError;

    switch (error.errorCode) {
        case undefined:
            return {
                title: keys.somethingWentWrong,
                messages: [message, keys.retry],
                refreshComponent: true,
            };
        case '00_500': {
            const secondaryErrorMessage: ErrorMessageKey<Key> = onContactSupport ? keys.errorCode : keys.errorCodeSupport;
            return {
                title: keys.somethingWentWrong,
                messages: [message, secondaryErrorMessage],
                onContactSupport,
                requestId: error.requestId,
            };
        }
        default:
            return unexpectedError;
    }
};

export default getErrorMessage;

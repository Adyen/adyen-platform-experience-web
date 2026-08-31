import { getErrorMessage, type ErrorMessageInfo, type ErrorMessageKeys, type ErrorWithCode } from './getErrorMessage';

/**
 * Balance-account error keys, supplied by the embedding domain alongside the shared
 * error-content keys. Domain-local translation names are opaque to portable code.
 */
export type DataOverviewErrorKeys<DomainKey extends string = string> = Readonly<{
    accountInvalid: DomainKey;
    accountUnavailable: DomainKey;
}>;

type GetDataOverviewErrorInfoOptions<Key extends string> = Readonly<{
    balanceAccountsError?: ErrorWithCode;
    errorMessage: Key;
    errorKeys: ErrorMessageKeys<Key>;
    hasError: boolean;
    isBalanceAccountIdWrong: boolean;
    onContactSupport?: () => void;
    overviewErrorKeys: DataOverviewErrorKeys<Key>;
}>;

export const getDataOverviewErrorInfo = <Key extends string>({
    balanceAccountsError,
    errorMessage,
    errorKeys,
    hasError,
    isBalanceAccountIdWrong,
    onContactSupport,
    overviewErrorKeys,
}: GetDataOverviewErrorInfoOptions<Key>): ErrorMessageInfo<Key> | undefined => {
    if (hasError) {
        // Mirrors the Preact ConfigProvider permission-unavailable composition:
        // the domain-specific unavailable copy followed by support guidance.
        return {
            title: errorKeys.somethingWentWrong,
            messages: [errorMessage, errorKeys.contactSupport],
        };
    }

    if (balanceAccountsError) {
        return getErrorMessage<Key>({
            error: balanceAccountsError,
            keys: errorKeys,
            message: overviewErrorKeys.accountUnavailable,
            onContactSupport,
        });
    }

    if (isBalanceAccountIdWrong) {
        return {
            title: errorKeys.somethingWentWrong,
            messages: [errorMessage, overviewErrorKeys.accountInvalid],
        };
    }

    return undefined;
};

export default getDataOverviewErrorInfo;

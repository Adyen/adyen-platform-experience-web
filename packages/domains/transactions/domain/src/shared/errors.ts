import { createDomainErrorResolver } from '@integration-components/core';
import type { TransactionsTranslationKey } from './types';

/**
 * Resolves the platform-wide error codes into transactions copy. The dispatch is shared; the wording
 * belongs to this domain, so renaming one of these keys breaks the build here rather than
 * rendering the key itself to the user.
 */
export const getTransactionsErrorConfig = createDomainErrorResolver<TransactionsTranslationKey>({
    contactSupport: 'transactions.common.errors.contactSupport',
    errorCode: 'transactions.common.errors.errorCode',
    errorCodeSupport: 'transactions.common.errors.errorCodeSupport',
    notFound: 'transactions.common.errors.notFound',
    requestInvalid: 'transactions.common.errors.requestInvalid',
    retry: 'transactions.common.errors.retry',
    somethingWentWrong: 'transactions.common.errors.somethingWentWrong',
    unexpected: 'transactions.common.errors.unexpected',
});

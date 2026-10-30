import { createDomainErrorResolver } from '@integration-components/core';
import type { PayByLinkTranslationKey } from './types';

/**
 * Resolves the platform-wide error codes into payByLink copy. The dispatch is shared; the wording
 * belongs to this domain, so renaming one of these keys breaks the build here rather than
 * rendering the key itself to the user.
 */
export const getPayByLinkErrorConfig = createDomainErrorResolver<PayByLinkTranslationKey>({
    contactSupport: 'payByLink.common.errors.contactSupport',
    errorCode: 'payByLink.common.errors.errorCode',
    errorCodeSupport: 'payByLink.common.errors.errorCodeSupport',
    notFound: 'payByLink.common.errors.notFound',
    requestInvalid: 'payByLink.common.errors.requestInvalid',
    retry: 'payByLink.common.errors.retry',
    somethingWentWrong: 'payByLink.common.errors.somethingWentWrong',
    unexpected: 'payByLink.common.errors.unexpected',
});

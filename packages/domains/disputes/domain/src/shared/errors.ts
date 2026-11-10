import { createDomainErrorResolver } from '@integration-components/core';
import type { DisputesTranslationKey } from './types';

/**
 * Resolves the platform-wide error codes into disputes copy. The dispatch is shared; the wording
 * belongs to this domain, so renaming one of these keys breaks the build here rather than
 * rendering the key itself to the user.
 */
export const getDisputesErrorConfig = createDomainErrorResolver<DisputesTranslationKey>({
    contactSupport: 'disputes.common.errors.contactSupport',
    errorCode: 'disputes.common.errors.errorCode',
    errorCodeSupport: 'disputes.common.errors.errorCodeSupport',
    notFound: 'disputes.common.errors.notFound',
    requestInvalid: 'disputes.common.errors.requestInvalid',
    retry: 'disputes.common.errors.retry',
    somethingWentWrong: 'disputes.common.errors.somethingWentWrong',
    unexpected: 'disputes.common.errors.unexpected',
});

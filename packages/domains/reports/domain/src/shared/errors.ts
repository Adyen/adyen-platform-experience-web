import { createDomainErrorResolver } from '@integration-components/core';
import type { ReportsTranslationKey } from './types';

/**
 * Resolves the platform-wide error codes into reports copy. The dispatch is shared; the wording
 * belongs to this domain, so renaming one of these keys breaks the build here rather than
 * rendering the key itself to the user.
 */
export const getReportsErrorConfig = createDomainErrorResolver<ReportsTranslationKey>({
    contactSupport: 'reports.common.errors.contactSupport',
    errorCode: 'reports.common.errors.errorCode',
    errorCodeSupport: 'reports.common.errors.errorCodeSupport',
    notFound: 'reports.common.errors.notFound',
    requestInvalid: 'reports.common.errors.requestInvalid',
    retry: 'reports.common.errors.retry',
    somethingWentWrong: 'reports.common.errors.somethingWentWrong',
    unexpected: 'reports.common.errors.unexpected',
});

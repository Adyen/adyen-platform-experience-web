import { createDomainErrorResolver } from '@integration-components/core';
import type { PayoutsTranslationKey } from './types';

/**
 * Resolves the platform-wide error codes into payouts copy. The dispatch is shared; the wording
 * belongs to this domain, so renaming one of these keys breaks the build here rather than
 * rendering the key itself to the user.
 */
export const getPayoutsErrorConfig = createDomainErrorResolver<PayoutsTranslationKey>({
    contactSupport: 'payouts.common.errors.contactSupport',
    errorCode: 'payouts.common.errors.errorCode',
    errorCodeSupport: 'payouts.common.errors.errorCodeSupport',
    notFound: 'payouts.common.errors.notFound',
    requestInvalid: 'payouts.common.errors.requestInvalid',
    retry: 'payouts.common.errors.retry',
    somethingWentWrong: 'payouts.common.errors.somethingWentWrong',
    unexpected: 'payouts.common.errors.unexpected',
});

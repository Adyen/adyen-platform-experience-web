import { ExternalComponentType } from '@integration-components/types';
import type { TranslationKey } from '../../../../translations';

function componentAvailabilityErrors(type: ExternalComponentType | undefined): TranslationKey;
function componentAvailabilityErrors<Fallback extends string>(type: ExternalComponentType | undefined, fallback: Fallback): TranslationKey | Fallback;
function componentAvailabilityErrors(type: ExternalComponentType | undefined, fallback = 'common.errors.componentUnavailable'): string {
    switch (type) {
        case 'transactions':
            return 'transactions.overview.errors.unavailable';
        case 'payouts':
            return 'payouts.overview.errors.unavailable';
        case 'reports':
            return 'reports.overview.errors.unavailable';
        case 'disputes':
            return 'disputes.overview.common.errors.unavailable';
        case 'transactionDetails':
            return 'transactions.details.errors.unavailable';
        case 'payoutDetails':
            return 'payouts.details.errors.unavailable';
        case 'disputesManagement':
            return 'disputes.management.common.errors.unavailable';
        case 'paymentLinksOverview':
            return 'payByLink.overview.errors.unavailable';
        default:
            return fallback;
    }
}

export default componentAvailabilityErrors;

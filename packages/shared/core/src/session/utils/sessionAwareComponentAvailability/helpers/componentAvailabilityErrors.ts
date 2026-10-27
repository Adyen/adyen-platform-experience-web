import { getDomainTranslationKey } from '../../../../translations';
import type { DomainTranslationKey, TranslationDomain } from '../../../../translations';
import type { ExternalComponentType } from '@integration-components/types';

/** Maps a component type to its "unavailable" message, falling back for types that have none. */
function componentAvailabilityErrors(type: ExternalComponentType | undefined, fallback: DomainTranslationKey): DomainTranslationKey {
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
        case 'paymentLinkCreation':
            return 'payByLink.creation.errors.unavailable';
        case 'paymentLinkDetails':
            return 'payByLink.details.errors.unavailable';
        case 'capitalOffer':
            return 'capital.offer.common.errors.unavailable';
        case 'capitalOverview':
            return 'capital.overview.common.errors.unavailable';
        case 'paymentLinkSettings':
            return 'payByLink.settings.errors.unavailable';
        default:
            return fallback;
    }
}

export function getComponentAvailabilityErrorTitle(domain: TranslationDomain): DomainTranslationKey {
    return getDomainTranslationKey(domain, 'common.errors.somethingWentWrong');
}

export function getComponentAvailabilityErrorMessages(type: ExternalComponentType | undefined, domain: TranslationDomain): DomainTranslationKey[] {
    return [
        componentAvailabilityErrors(type, getDomainTranslationKey(domain, 'common.errors.componentUnavailable')),
        getDomainTranslationKey(domain, 'common.errors.contactSupport'),
    ];
}

export default componentAvailabilityErrors;

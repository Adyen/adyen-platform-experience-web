import { getSafeDomainTranslationKey } from '../../../../translations';
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
            return 'disputes.overview.errors.unavailable';
        case 'transactionDetails':
            return 'transactions.details.errors.unavailable';
        case 'payoutDetails':
            return 'payouts.details.errors.unavailable';
        case 'disputesManagement':
            return 'disputes.management.errors.unavailable';
        case 'paymentLinksOverview':
            return 'payByLink.overview.errors.unavailable';
        case 'paymentLinkCreation':
            return 'payByLink.creation.errors.unavailable';
        case 'paymentLinkDetails':
            return 'payByLink.details.errors.unavailable';
        case 'capitalOffer':
            return 'capital.offer.errors.unavailable';
        case 'capitalOverview':
            return 'capital.overview.errors.unavailable';
        case 'paymentLinkSettings':
            return 'payByLink.settings.errors.unavailable';
        default:
            return fallback;
    }
}

export function getComponentAvailabilityErrorTitle(domain: TranslationDomain): DomainTranslationKey {
    return getSafeDomainTranslationKey(domain, 'common.errors.somethingWentWrong');
}

export function getComponentAvailabilityErrorMessages(type: ExternalComponentType | undefined, domain: TranslationDomain): DomainTranslationKey[] {
    return [
        componentAvailabilityErrors(type, getSafeDomainTranslationKey(domain, 'common.errors.componentUnavailable')),
        getSafeDomainTranslationKey(domain, 'common.errors.contactSupport'),
    ];
}

export default componentAvailabilityErrors;

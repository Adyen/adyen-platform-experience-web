import { ExternalComponentType } from '../../../../../../components/types';
import { TranslationKey } from '../../../../../../translations';

const componentAvailabilityErrors = (type: ExternalComponentType): TranslationKey => {
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
        default:
            return 'common.errors.componentUnavailable';
    }
};

export default componentAvailabilityErrors;

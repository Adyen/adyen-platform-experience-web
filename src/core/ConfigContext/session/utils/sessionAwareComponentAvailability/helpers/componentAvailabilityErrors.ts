import { ExternalComponentType } from '../../../../../../components/types';
import { TranslationKey } from '../../../../../../translations';

const componentAvailabilityErrors = (type: ExternalComponentType): TranslationKey => {
    switch (type) {
        case 'payouts':
            return 'weCouldNotLoadThePayoutsOverview';
        case 'transactions':
            return 'weCouldNotLoadTheTransactionsOverview';
        case 'transactionDetails':
            return 'weCouldNotLoadYourTransactions';
        case 'payoutDetails':
            return 'weCouldNotLoadYourPayouts';
        case 'reports':
            return 'weCouldNotLoadTheReportsOverview';
        default:
            return 'somethingWentWrong';
    }
};

export default componentAvailabilityErrors;

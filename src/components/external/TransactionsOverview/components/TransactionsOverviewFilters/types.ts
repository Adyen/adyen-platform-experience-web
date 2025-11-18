import { IBalanceAccountBase, ITransaction } from '../../../../../types';
import { RangeTimestamps } from '../../../../internal/Calendar/calendar/timerange';

export interface TransactionsOverviewFilters {
    balanceAccount?: Readonly<IBalanceAccountBase>;
    categories: readonly ITransaction['category'][];
    statuses: readonly ITransaction['status'][];
    currencies: readonly string[];
    createdDate: RangeTimestamps;
    pspReference?: string;
}

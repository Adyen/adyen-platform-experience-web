import { RestamperWithTimezone } from '../../../core/Localization/datetime/restamper';
import type { WatchList } from '../../reactive/watchlist';

export interface TodayWatchListEntries {
    timestamp: number;
}

export interface Today extends Readonly<TodayWatchListEntries>, Pick<WatchList<TodayWatchListEntries>, 'cancelSubscriptions' | 'subscribe'> {
    readonly timezone: RestamperWithTimezone['tz']['current'];
}

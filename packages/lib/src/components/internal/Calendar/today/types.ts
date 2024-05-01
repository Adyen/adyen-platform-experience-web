import { RestamperWithTimezone } from '@src/core/Localization/datetime/restamper';
import type { WatchList } from '@src/primitives/common/watchlist';

export interface TodayWatchListEntries {
    timestamp: number;
}

export interface Today extends Readonly<TodayWatchListEntries>, Pick<WatchList<TodayWatchListEntries>, 'cancelSubscriptions' | 'subscribe'> {
    readonly timezone: RestamperWithTimezone['tz']['current'];
}

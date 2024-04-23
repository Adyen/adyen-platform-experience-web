import { WatchList } from '@src/primitives/common/watchlist/types';
import { RestamperWithTimezone } from '@src/core/Localization/datetime/restamper';

export type Clock<T extends Record<any, any> = {}> = Readonly<{
    timestamp: number;
    watch: WatchList<{ timestamp: number } & T>['subscribe'];
}>;

export type Today = Clock &
    Readonly<{
        timezone: RestamperWithTimezone['tz']['current'];
    }>;

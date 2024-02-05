import { Watchable } from '@src/utils/watchable/types';
import { RestamperWithTimezone } from '@src/core/Localization/datetime/restamper';

export type Clock<T extends Record<any, any> = {}> = Readonly<{
    timestamp: number;
    watch: Watchable<{ timestamp: number } & T>['watch'];
}>;

export type Today = Clock &
    Readonly<{
        timezone: RestamperWithTimezone['tz']['current'];
    }>;

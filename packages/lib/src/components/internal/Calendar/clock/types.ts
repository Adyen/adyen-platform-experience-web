import { Watchable } from '../../../../utils/watchable/types';
import { RestamperWithTimezone } from '../../../../core/Localization/datetime/restamper';

export type Clock<T extends Record<any, any> = {}> = Readonly<{
    timestamp: number;
    watch: Watchable<{ timestamp: number } & T>['watch'];
}>;

export type Today = Clock &
    Readonly<{
        timezone: RestamperWithTimezone['tz']['current'];
    }>;

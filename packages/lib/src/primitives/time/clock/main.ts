import { createInterval, Interval } from '../interval';
import { createWatchlist } from '../../reactive/watchlist';
import { enumerable, struct } from '../../../utils';
import type { Clock, ClockWatchListEntries } from './types';

export const clock = (() => {
    let interval: Interval | undefined;

    const { cancelSubscriptions, requestNotification, subscribe, on } = createWatchlist<ClockWatchListEntries>({
        // Use wrapper function instead of direct reference to `Date.now`,
        // otherwise, tests will fail since `Date.now` won't be mocked
        now: () => Date.now(),
    });

    on.resume = () => {
        interval = createInterval(requestNotification, 1000, false);
    };

    on.idle = () => {
        interval?.cancel();
        interval = undefined;
    };

    return struct<Clock>({
        cancelSubscriptions: enumerable(cancelSubscriptions),
        subscribe: enumerable(subscribe),
    });
})();

export default clock;

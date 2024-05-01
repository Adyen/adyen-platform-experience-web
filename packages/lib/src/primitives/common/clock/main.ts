import { createInterval, Interval } from '@src/primitives/common/interval';
import { createWatchlist } from '@src/primitives/common/watchlist';
import { enumerable, struct } from '@src/utils/common';
import type { Clock, ClockWatchListEntries } from './types';

export const clock = (() => {
    let interval: Interval | undefined;

    const { cancelSubscriptions, requestNotification, subscribe, on } = createWatchlist<ClockWatchListEntries>({ now: () => Date.now() });

    on.resume = () => {
        interval = createInterval(requestNotification, 1000, false);
    };

    on.idle = () => {
        interval?.cancel();
        interval = undefined;
    };

    return struct({
        cancelSubscriptions: enumerable(cancelSubscriptions),
        subscribe: enumerable(subscribe),
    }) as Clock;
})();

export default clock;

import type { WatchList } from '@src/primitives/common/watchlist';

export interface ClockWatchListEntries {
    now: number;
}

export interface Clock extends Pick<WatchList<ClockWatchListEntries>, 'cancelSubscriptions' | 'subscribe'> {}

import type { WatchList } from '../../reactive/watchlist';

export interface ClockWatchListEntries {
    now: number;
}

export interface Clock extends Pick<WatchList<ClockWatchListEntries>, 'cancelSubscriptions' | 'subscribe'> {}

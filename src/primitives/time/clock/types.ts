import type { WatchList } from '../../reactive/watchlist';

export interface ClockWatchListEntries {
    now: number;
}

export type Clock = Pick<WatchList<ClockWatchListEntries>, 'cancelSubscriptions' | 'subscribe'>;

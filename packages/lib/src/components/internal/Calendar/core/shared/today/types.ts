import { Watchable } from '../watchable/types';

export type Today = {
    readonly timestamp: number;
    readonly watch: Watchable<{}>['watch'];
};

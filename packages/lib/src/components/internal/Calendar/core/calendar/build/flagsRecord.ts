import { CalendarFlagsRecord, TimeFlag } from '../types';
import { immutableProxyHandlers } from '../../shared/constants';
import { struct } from '../../shared/utils';

const getFlagsRecord = (() => {
    const cache = {} as { [K: number]: CalendarFlagsRecord };

    return (flags: number): CalendarFlagsRecord => {
        const flagsTruncated = flags & TimeFlag.ALL;

        if (!cache[flagsTruncated]) {
            cache[flagsTruncated] = new Proxy(
                struct({
                    valueOf: { value: () => flagsTruncated },
                }),
                {
                    ...immutableProxyHandlers,
                    get: (target: {}, property: string | symbol) => {
                        switch (property) {
                            case 'BLOCK_END':
                            case 'BLOCK_START':
                            case 'CURSOR':
                            case 'LINE_END':
                            case 'LINE_START':
                            case 'RANGE_END':
                            case 'RANGE_START':
                            case 'SELECTION_END':
                            case 'SELECTION_START':
                            case 'TODAY':
                            case 'WEEKEND':
                            case 'WITHIN_BLOCK':
                            case 'WITHIN_RANGE':
                            case 'WITHIN_SELECTION':
                                return flagsTruncated & (TimeFlag[property] as number) ? 1 : undefined;
                            case 'valueOf':
                                return target.valueOf;
                            case Symbol.toStringTag:
                                return 'Integer';
                        }
                    },
                }
            ) as CalendarFlagsRecord;
        }

        return cache[flagsTruncated] as CalendarFlagsRecord;
    };
})();

export default getFlagsRecord;

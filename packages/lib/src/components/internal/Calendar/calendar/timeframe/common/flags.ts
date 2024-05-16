import { CalendarFlagsRecord, TimeFlag, TimeFlagProp } from '../../types';
import { immutableProxyHandlers, struct } from '../../../../../../utils/common';
import { isString } from '../../../../../../utils/validator-utils';

const createFlagsRecord = (() => {
    const CACHE = {} as { [K: number]: CalendarFlagsRecord };
    const FLAG_PROPS = Object.keys(TimeFlag).filter(prop => isNaN(+prop)) as TimeFlagProp[];

    const isFlagProp = (property: string | symbol): property is TimeFlagProp =>
        property !== 'ALL' && isString(property) && FLAG_PROPS.includes(property as TimeFlagProp);

    return (flags: number): CalendarFlagsRecord => {
        const flagsTruncated = flags & TimeFlag.ALL;

        if (!CACHE[flagsTruncated]) {
            CACHE[flagsTruncated] = new Proxy(
                struct({
                    valueOf: { value: () => flagsTruncated },
                }),
                {
                    ...immutableProxyHandlers,
                    get: (target: {}, property: string | symbol) => {
                        switch (property) {
                            case 'valueOf':
                                return target.valueOf;
                            case Symbol.toStringTag:
                                return '_';
                            default:
                                if (!isFlagProp(property)) return;
                        }

                        return flagsTruncated & (TimeFlag[property] as number) ? 1 : undefined;
                    },
                }
            ) as CalendarFlagsRecord;
        }

        return CACHE[flagsTruncated] as CalendarFlagsRecord;
    };
})();

export default createFlagsRecord;

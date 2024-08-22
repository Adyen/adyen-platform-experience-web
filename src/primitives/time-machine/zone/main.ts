import { Zone } from './zone';
import { getResolvedTimezone } from './utils';
import { getMappedValue, getter } from '../../../utils';
import type { RecordWithTimezone } from '../types';

export const zone = (() => {
    const ZONES = new Map<string, Zone>();

    const zone = (timezone?: string) => {
        const tz = getResolvedTimezone(timezone);
        return getMappedValue(tz, ZONES, tz => new Zone(tz))!;
    };

    return Object.defineProperties(zone as typeof zone & { SYSTEM_TIMEZONE?: string }, {
        SYSTEM_TIMEZONE: getter(getResolvedTimezone),
    });
})();

export const zoneFrom = (recordWithTimezone?: RecordWithTimezone) =>
    recordWithTimezone instanceof Zone ? recordWithTimezone : zone(recordWithTimezone?.timezone);

export default zone;

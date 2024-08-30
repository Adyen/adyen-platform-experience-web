import { Zone } from './zone';
import { getResolvedTimezone } from './utils';
import { getMappedValue, getter, isString } from '../../../utils';
import type { TimezoneDataSource } from '../types';

export const zone = (() => {
    const ZONES = new Map<string, Zone>();

    const zone = (timezone?: string) => {
        const tz = getResolvedTimezone(timezone);
        return getMappedValue(tz, ZONES, tz => new Zone(tz))!;
    };

    return Object.defineProperties(zone as typeof zone & { SYSTEM?: string }, {
        SYSTEM: getter(getResolvedTimezone),
    });
})();

export const zoneFrom = (timezoneDataSource?: TimezoneDataSource) => {
    if (timezoneDataSource instanceof Zone) return timezoneDataSource;
    const timezone = isString(timezoneDataSource) ? timezoneDataSource.trim() : timezoneDataSource?.timezone;
    return timezone ? zone(timezone) : zone();
};

export default zone;

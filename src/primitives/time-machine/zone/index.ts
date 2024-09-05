import { Zone } from './zone';
import { getResolvedTimezone } from './utils';
import { getMappedValue, getter, isString } from '../../../utils';
import type { TimezoneDataSource } from '../types';

export interface ZoneFn {
    (timezone?: string): Zone;
}

export const zone = (() => {
    const ZONES = new Map<string, Zone>();

    const zone = ((timezone?: string) => {
        const tz = getResolvedTimezone(timezone);
        return getMappedValue(tz, ZONES, tz => new Zone(tz))!;
    }) as ZoneFn & Readonly<{ SYSTEM: string }>;

    return Object.defineProperty(zone, 'SYSTEM', getter(getResolvedTimezone));
})();

export const zoneFrom = (timezoneDataSource?: TimezoneDataSource) => {
    if (timezoneDataSource instanceof Zone) return timezoneDataSource;
    const timezone = isString(timezoneDataSource) ? timezoneDataSource.trim() : timezoneDataSource?.timezone;
    return timezone ? zone(timezone) : zone();
};

export default zone;

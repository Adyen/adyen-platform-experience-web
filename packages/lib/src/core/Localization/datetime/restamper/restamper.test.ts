import { beforeEach, describe, expect, expectTypeOf, test } from 'vitest';
import { REGEX_TZ_OFFSET } from './constants';
import restamper from './restamper';
import { DST_TIMEZONES, NON_DST_TIMEZONES, RestamperTestContext } from './testing/fixtures';
import { getPastDatesMapForEachMonthInYear, runTimezoneTestRoutine } from './testing/helpers';
import type { RestamperWithTimezone, RestampResult } from './types';

describe('restamper', () => {
    beforeEach<RestamperTestContext>(context => {
        const _restamper = restamper();

        Object.defineProperties(context, {
            currentOffset: { value: _restamper().offset, enumerable: true },
            restamper: { value: _restamper, enumerable: true },
            timezone: { value: _restamper.tz, enumerable: true },
        });
    });

    test<RestamperTestContext>('should return restamp instance', ({ restamper, timezone }) => {
        const { system: systemTimezone } = timezone;
        const invalidTimezone = 'Unknown/Invalid_TZ';
        const validTimezone = 'Asia/Tokyo';

        expectTypeOf<RestamperWithTimezone>(restamper);
        expectTypeOf<RestampResult>(restamper());
        expectTypeOf<RestampResult>(restamper(new Date('2012-08-22')));
        expectTypeOf<RestamperWithTimezone['tz']>(timezone);

        expect(restamper).toHaveProperty('tz');
        expect(timezone).toHaveProperty('current');
        expect(timezone).toHaveProperty('system');

        expect(timezone.system).toBeTypeOf('string');
        expect(timezone.current).toBeTypeOf('string');
        expect(timezone.current).toBe(timezone.system);

        restamper.tz = validTimezone;
        expect(timezone.current).toBe(validTimezone);
        expect(timezone.system).toBe(systemTimezone); // unchanged

        restamper.tz = invalidTimezone;
        expect(timezone.current).not.toBe(invalidTimezone); // invalid — ignored
        expect(timezone.current).toBe(validTimezone); // unchanged
        expect(timezone.system).toBe(systemTimezone); // unchanged
    });

    test<RestamperTestContext>('should return restamp result for current time (when argument is omitted)', ({ restamper }) => {
        let result = restamper();

        expect(result).toHaveProperty('formatted');
        expect(result).toHaveProperty('offset');
        expect(result).toHaveProperty('timestamp');

        expect(result.offset).toBeTypeOf('number');
        expect(result.offset).toBe(0); // system timezone (offset is 0)

        expect(result.timestamp).toBeTypeOf('number');
        expect(result.timestamp).toBeCloseTo(Date.now(), -2);

        if (result.formatted !== undefined) {
            expect(result.formatted).toBeTypeOf('string');
            expect(REGEX_TZ_OFFSET.test(result.formatted)).toBe(true); // formatted date should end with tz offset
        }
    });

    test<RestamperTestContext>('should have correct offsets for non-DST timezones for times in the past', ({ restamper }) => {
        const pastDatesMap = getPastDatesMapForEachMonthInYear(restamper);

        NON_DST_TIMEZONES.forEach((timezoneOffset, timezone) => {
            restamper.tz = timezone;

            pastDatesMap.forEach((systemTimezoneResult, date) => {
                const result = restamper(date);
                runTimezoneTestRoutine(timezoneOffset, systemTimezoneResult, result);
            });
        });
    });

    test<RestamperTestContext>('should have correct offsets for DST timezones for times in the past', ({ restamper }) => {
        const pastDatesMap = getPastDatesMapForEachMonthInYear(restamper);

        DST_TIMEZONES.forEach((timezoneOffsets, timezone) => {
            restamper.tz = timezone;

            let index = 0;

            for (const [date, systemTimezoneResult] of pastDatesMap) {
                const result = restamper(date);
                const timezoneOffsetForCurrentTime = timezoneOffsets[index++] as number;
                runTimezoneTestRoutine(timezoneOffsetForCurrentTime, systemTimezoneResult, result);
            }
        });
    });
});

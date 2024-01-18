import { beforeEach, describe, expect, expectTypeOf, test } from 'vitest';
import type { Restamp, RestampResult } from '@src/core/Localization/types';
import restamper, { REGEX_TZ_OFFSET } from './restamper';
import { DST_TIMEZONES, NON_DST_TIMEZONES, getPastDatesMapForEachMonthInYear, runTimezoneTestRoutine, RestampContext } from './restampter-test-utils';

describe('restamper', () => {
    beforeEach<RestampContext>(context => {
        const instance = restamper();

        Object.defineProperties(context, {
            currentOffsets: { value: instance().offsets, enumerable: true },
            instance: { value: instance, enumerable: true },
            timezone: { value: instance.tz, enumerable: true },
        });
    });

    test<RestampContext>('should return restamp instance', ({ instance, timezone }) => {
        const { system: systemTimezone } = timezone;
        const invalidTimezone = 'Unknown/Invalid_TZ';
        const validTimezone = 'Asia/Tokyo';

        expectTypeOf<Restamp>(instance);
        expectTypeOf<RestampResult>(instance());
        expectTypeOf<RestampResult>(instance(new Date('2012-08-22')));
        expectTypeOf<Restamp['tz']>(timezone);

        expect(instance).toHaveProperty('tz');
        expect(timezone).toHaveProperty('current');
        expect(timezone).toHaveProperty('system');

        expect(timezone.system).toBeTypeOf('string');
        expect(timezone.current).toBeTypeOf('string');
        expect(timezone.current).toBe(timezone.system);

        instance.tz = validTimezone;
        expect(timezone.current).toBe(validTimezone);
        expect(timezone.system).toBe(systemTimezone); // unchanged

        instance.tz = invalidTimezone;
        expect(timezone.current).not.toBe(invalidTimezone); // invalid — ignored
        expect(timezone.current).toBe(validTimezone); // unchanged
        expect(timezone.system).toBe(systemTimezone); // unchanged
    });

    test<RestampContext>('should return restamp result for current time (when argument is omitted)', ({ instance }) => {
        let result = instance();

        expect(result).toHaveProperty('formatted');
        expect(result).toHaveProperty('offsets');
        expect(result).toHaveProperty('timestamp');

        expect(result.offsets).toBeInstanceOf(Array);
        expect(result.offsets).toHaveLength(2);
        expect(result.offsets[0]).toBe(0); // system timezone (hour offset is 0)
        expect(result.offsets[1]).toBe(result.offsets[0]); // system timezone (minute offset is also 0)

        expect(result.timestamp).toBeTypeOf('number');
        expect(result.timestamp).toBeCloseTo(Date.now(), -2);

        if (result.formatted !== undefined) {
            expect(result.formatted).toBeTypeOf('string');
            expect(REGEX_TZ_OFFSET.test(result.formatted)).toBe(true); // formatted date should end with tz offset
        }
    });

    test<RestampContext>('should have correct offsets for non-DST timezones for times in the past', ({ instance }) => {
        const pastDatesMap = getPastDatesMapForEachMonthInYear(instance);

        NON_DST_TIMEZONES.forEach((timezoneOffsets, timezone) => {
            instance.tz = timezone;

            pastDatesMap.forEach((systemTimezoneResult, date) => {
                const result = instance(date);
                runTimezoneTestRoutine(timezoneOffsets, systemTimezoneResult, result);
            });
        });
    });

    test<RestampContext>('should have correct offsets for DST timezones for times in the past', ({ instance }) => {
        const pastDatesMap = getPastDatesMapForEachMonthInYear(instance);

        DST_TIMEZONES.forEach((timezoneOffsets, timezone) => {
            instance.tz = timezone;

            let index = 0;

            for (const [date, systemTimezoneResult] of pastDatesMap) {
                const result = instance(date);
                const timezoneOffsetsForCurrentTime = timezoneOffsets[index++] as [number, number];
                runTimezoneTestRoutine(timezoneOffsetsForCurrentTime, systemTimezoneResult, result);
            }
        });
    });
});

import { beforeEach, describe, expect, expectTypeOf, test } from 'vitest';
import type { Restamp, RestampResult } from '@src/core/Localization/types';
import restamper, { REGEX_TZ_OFFSET } from './restamper';

describe('restamper', () => {
    type RestampContext = Readonly<{
        instance: Restamp;
        offsets: RestampResult['offsets'];
        timezone: Restamp['tz'];
    }>;

    beforeEach<RestampContext>(context => {
        const instance = restamper();

        Object.defineProperties(context, {
            currentOffsets: { value: instance().offsets, enumerable: true },
            instance: { value: instance, enumerable: true },
            timezone: { value: instance.tz, enumerable: true },
        });
    });

    test<RestampContext>('should return restamp instance', ({ instance, timezone }) => {
        const validTimezone = 'Asia/Tokyo';
        const invalidTimezone = 'Unknown/Invalid_TZ';

        expectTypeOf<Restamp>(instance);
        expectTypeOf<RestampResult>(instance());
        expectTypeOf<RestampResult>(instance(new Date('2012-08-22')));

        expect(instance).toHaveProperty('tz');
        expect(timezone).toBeTypeOf('string');

        instance.tz = validTimezone;
        expect(instance.tz).toBe(validTimezone);

        instance.tz = invalidTimezone;
        expect(instance.tz).not.toBe(invalidTimezone);
        expect(instance.tz).toBe(validTimezone);
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
});

import { assertType, describe, expect, test } from 'vitest';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SYSTEM_TIMEZONE } from '../../../../../core/Localization/datetime/restamper';
import createRangeTimestampsFactory from './factory';
import type { RangeTimestamps } from './types';

describe('createRangeTimestampsFactory', () => {
    type RangeTimestampsAdditionalContextFromPropertyDescriptors<T extends Record<any, TypedPropertyDescriptor<any>> = {}> = Omit<
        {
            [P in keyof T]: T[P] extends TypedPropertyDescriptor<infer U> ? U : never;
        },
        keyof RangeTimestamps
    >;

    const DATE_NOW = Date.now();
    const NOW_DATE = new Date(DATE_NOW).getDate();
    const DAY_OFFSETS = Object.freeze([0, 0, 1, 0, 0, 0, -1] as const);
    const DAY_OFFSETS_INVERTED = Object.freeze(DAY_OFFSETS.map(x => -x)) as typeof DAY_OFFSETS;
    const DAY_START = new Date(DATE_NOW).setHours(0, 0, 0, 0);
    const DAY_END = new Date(DAY_START).setDate(NOW_DATE + 1) - 1;
    const ZONE_OFFSET = new Date(DATE_NOW).getTimezoneOffset();

    new Map([
        ['from and to timestamps', { from: DAY_START, to: DAY_END }],
        ['from timestamp and offset', { from: DAY_START, offsets: DAY_OFFSETS }],
        ['to timestamp and offset', { to: DAY_END, offsets: DAY_OFFSETS }],
    ]).forEach((config, description) => {
        test(`should return a range timestamps factory (config => ${description})`, () => {
            const factory = createRangeTimestampsFactory(config);
            const todayTimestamps = factory();

            assertType<() => RangeTimestamps>(factory);
            assertType<RangeTimestamps>(todayTimestamps);

            expect(factory).toBeTypeOf('function');
            expect(factory).toHaveLength(0);

            expect(todayTimestamps).toHaveProperty('from');
            expect(todayTimestamps).toHaveProperty('now');
            expect(todayTimestamps).toHaveProperty('timezone');
            expect(todayTimestamps).toHaveProperty('to');

            expect(todayTimestamps.from).toBeTypeOf('number');
            expect(todayTimestamps.now).toBeTypeOf('number');
            expect(todayTimestamps.timezone).toBeTypeOf('string');
            expect(todayTimestamps.to).toBeTypeOf('number');

            expect(todayTimestamps.from).toBe(DAY_START);
            expect(todayTimestamps.to).toBe(DAY_END);
            expect(todayTimestamps.timezone).toBe(SYSTEM_TIMEZONE);
            expect(todayTimestamps.now).toBeCloseTo(DATE_NOW, -3);
            expect(todayTimestamps.now).not.toBe(DATE_NOW);

            todayTimestamps.now = DATE_NOW;
            expect(todayTimestamps.now).toBe(DATE_NOW);

            todayTimestamps.now = -Infinity; // invalid value (now will be unchanged)
            expect(todayTimestamps.now).toBe(DATE_NOW);

            todayTimestamps.now = null; // reset value (now will be Date.now())
            expect(todayTimestamps.now).not.toBe(DATE_NOW);
            expect(todayTimestamps.now).toBeCloseTo(Date.now(), -3);
        });
    });

    new Map([
        ['from and to timestamps', { from: DAY_END, to: DAY_START }],
        ['from timestamp and offset', { from: DAY_END, offsets: DAY_OFFSETS_INVERTED }],
        ['to timestamp and offset', { to: DAY_START, offsets: DAY_OFFSETS_INVERTED }],
    ]).forEach((config, description) => {
        test(`should correctly order inverted timestamps (config => ${description})`, () => {
            const todayTimestamps = createRangeTimestampsFactory(config)();
            expect(todayTimestamps.from).toBe(DAY_START);
            expect(todayTimestamps.to).toBe(DAY_END);
        });
    });

    test('should return a range timestamps factory with additional context properties', () => {
        type AdditionalContext = RangeTimestampsAdditionalContextFromPropertyDescriptors<typeof additionalContextPropDescriptors>;

        const FROM = 'FROM' as const;
        const LABEL = 'today' as const;

        const additionalContextPropDescriptors = {
            from: { enumerable: true, value: FROM }, // will be discarded since it conflicts with the from timestamp property
            label: { enumerable: true, value: LABEL },
            offset: { enumerable: true, get: () => new Date().getTimezoneOffset() },
        };

        const config = { from: DAY_START, to: DAY_END };
        const factory = createRangeTimestampsFactory(config, additionalContextPropDescriptors);
        const todayTimestamps = factory();

        assertType<() => RangeTimestamps<AdditionalContext>>(factory);
        assertType<RangeTimestamps<AdditionalContext>>(todayTimestamps);

        expect(todayTimestamps).toHaveProperty('from');
        expect(todayTimestamps).toHaveProperty('now');
        expect(todayTimestamps).toHaveProperty('timezone');
        expect(todayTimestamps).toHaveProperty('to');
        expect(todayTimestamps).toHaveProperty('label');
        expect(todayTimestamps).toHaveProperty('offset');

        expect(todayTimestamps.from).toBeTypeOf('number');
        expect(todayTimestamps.now).toBeTypeOf('number');
        expect(todayTimestamps.timezone).toBeTypeOf('string');
        expect(todayTimestamps.to).toBeTypeOf('number');
        expect(todayTimestamps.label).toBeTypeOf(typeof LABEL);
        expect(todayTimestamps.offset).toBeTypeOf('number');

        expect(todayTimestamps.from).toBe(DAY_START);
        expect(todayTimestamps.from).not.toBe(FROM);
        expect(todayTimestamps.to).toBe(DAY_END);
        expect(todayTimestamps.timezone).toBe(SYSTEM_TIMEZONE);
        expect(todayTimestamps.label).toBe(LABEL);
        expect(todayTimestamps.offset).toBe(ZONE_OFFSET);
    });

    test('should use correct config context for callable config properties', () => {
        const todayTimestamps = createRangeTimestampsFactory({
            from: DAY_START,
            to: ({ now, systemToTimezone, timezone, timezoneToSystem, timezoneOffset }) => {
                expect(now).toBeTypeOf('number');
                expect(timezone).toBeTypeOf('string');
                expect(systemToTimezone).toBeTypeOf('function');
                expect(timezoneToSystem).toBeTypeOf('function');
                expect(timezoneOffset).toBeTypeOf('function');

                expect(timezone).toBe(SYSTEM_TIMEZONE);
                expect(systemToTimezone(now)).toBeTypeOf('number');
                expect(timezoneToSystem(now)).toBeTypeOf('number');
                expect(timezoneOffset(now)).toBe(0); // system timezone (no offset)

                return now;
            },
        })();

        expect(todayTimestamps.from).toBe(DAY_START);
        expect(todayTimestamps.to).toBe(todayTimestamps.now);

        [
            DATE_NOW,
            -Infinity, // invalid value (now will be unchanged)
            null, // reset value (now will be Date.now())
        ].forEach(NOW => {
            todayTimestamps.now = NOW;
            expect(todayTimestamps.from).toBe(DAY_START);
            expect(todayTimestamps.to).toBe(todayTimestamps.now);
        });
    });

    test('should use config object as `this` binding where possible for callable config properties', () => {
        const todayTimestamps = createRangeTimestampsFactory({
            from(context) {
                return new Date(this.to(context)).setHours(0, 0, 0, 0);
            },
            to: ({ now }) => now,
        })();

        expect(todayTimestamps.from).toBe(DAY_START);
        expect(todayTimestamps.to).toBe(todayTimestamps.now);

        [
            DATE_NOW,
            -Infinity, // invalid value (now will be unchanged)
            null, // reset value (now will be Date.now())
        ].forEach(NOW => {
            todayTimestamps.now = NOW;
            expect(todayTimestamps.from).toBe(DAY_START);
            expect(todayTimestamps.to).toBe(todayTimestamps.now);
        });
    });
});

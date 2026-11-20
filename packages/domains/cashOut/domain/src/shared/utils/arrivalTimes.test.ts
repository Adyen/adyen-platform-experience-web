import { describe, expect, test, vi } from 'vitest';
import type { CdnFetcher } from '@integration-components/core';
import localArrivalTimes from '../../config/arrivalTimes.json';
import { DEFAULT_ARRIVAL_DURATION, getArrivalTime, getArrivalTimes, type CashOutArrivalTimes } from './arrivalTimes';

const ARRIVAL_TIMES: CashOutArrivalTimes = {
    defaultDuration: 'PT30M',
    durationByCurrency: { AUD: 'PT5M', EUR: 'PT5M', GBP: 'PT5M', USD: 'PT5M' },
};

const MINUTES = 'cashOut.common.arrivalTime.withinMinutes';
const HOURS = 'cashOut.common.arrivalTime.withinHours';
const DAYS = 'cashOut.common.arrivalTime.withinDays';
const LESS_THAN_A_MINUTE = 'cashOut.common.arrivalTime.lessThanAMinute';

const arrivalTimeOf = (duration: unknown) => getArrivalTime({ defaultDuration: duration } as CashOutArrivalTimes, 'SEK');

describe('getArrivalTimes', () => {
    test('should load the arrival times of the cashOut config from the CDN, with the bundled ones as fallback', async () => {
        const fromCdn = { defaultDuration: 'PT20M', durationByCurrency: { EUR: 'PT2M' } };
        const getCdnConfig = vi.fn().mockResolvedValue(fromCdn) as unknown as CdnFetcher;

        expect(await getArrivalTimes(getCdnConfig)).toBe(fromCdn);
        expect(getCdnConfig).toHaveBeenCalledWith({ subFolder: 'cashOut', name: 'arrivalTimes', fallback: localArrivalTimes });
    });

    test('should use the bundled arrival times without a CDN', async () => {
        expect(await getArrivalTimes(undefined)).toEqual(localArrivalTimes);
    });

    test('should use the bundled arrival times when the CDN gives none', async () => {
        const getCdnConfig = vi.fn().mockResolvedValue(undefined) as unknown as CdnFetcher;

        expect(await getArrivalTimes(getCdnConfig)).toEqual(localArrivalTimes);
    });

    // The CDN is updated without a release, so the bundled file is what applies until then.
    test('should bundle 5 minutes for AUD, EUR, GBP and USD, and 30 minutes for the others', () => {
        expect(localArrivalTimes).toEqual(ARRIVAL_TIMES);
    });
});

describe('getArrivalTime', () => {
    test.each(['AUD', 'EUR', 'GBP', 'USD'])('should give the arrival time of %s', currency => {
        expect(getArrivalTime(ARRIVAL_TIMES, currency)).toEqual({ key: MINUTES, count: 5 });
    });

    test('should give the default arrival time for a currency without its own', () => {
        expect(getArrivalTime(ARRIVAL_TIMES, 'SEK')).toEqual({ key: MINUTES, count: 30 });
        expect(getArrivalTime({ ...ARRIVAL_TIMES, defaultDuration: 'PT2H' }, 'SEK')).toEqual({ key: HOURS, count: 2 });
    });

    test('should give the default arrival time without a currency', () => {
        expect(getArrivalTime(ARRIVAL_TIMES, undefined)).toEqual({ key: MINUTES, count: 30 });
    });

    // A duration is told in the largest unit it fits in whole; otherwise in minutes, rounded up, as the money arrives "within" it.
    describe('Durations', () => {
        test.each<[string, object]>([
            ['PT30S', { key: LESS_THAN_A_MINUTE }],
            ['PT59S', { key: LESS_THAN_A_MINUTE }],
            ['PT1M', { key: MINUTES, count: 1 }],
            ['PT60S', { key: MINUTES, count: 1 }],
            ['PT90S', { key: MINUTES, count: 2 }],
            ['PT5M', { key: MINUTES, count: 5 }],
            ['PT90M', { key: MINUTES, count: 90 }],
            ['PT1H30M', { key: MINUTES, count: 90 }],
            ['PT60M', { key: HOURS, count: 1 }],
            ['PT1H', { key: HOURS, count: 1 }],
            ['PT2H', { key: HOURS, count: 2 }],
            ['PT36H', { key: HOURS, count: 36 }],
            ['PT24H', { key: DAYS, count: 1 }],
            ['P1D', { key: DAYS, count: 1 }],
            ['P3D', { key: DAYS, count: 3 }],
            ['P1DT2H', { key: HOURS, count: 26 }],
        ])('should tell %s as %j', (duration, arrivalTime) => {
            expect(arrivalTimeOf(duration)).toEqual(arrivalTime);
        });
    });

    // The CDN file is edited by hand, so what it holds is not trusted.
    describe('Invalid durations', () => {
        test.each<[string, unknown]>([
            ['no arrival times', undefined],
            ['no default', { durationByCurrency: {} }],
            ['something else than an object', 'thirty'],
        ])('should give the 30 minutes of the code when the config has %s', (_, arrivalTimes) => {
            expect(getArrivalTime(arrivalTimes as CashOutArrivalTimes, 'SEK')).toEqual({ key: MINUTES, count: 30 });
        });

        test.each<[string, unknown]>([
            ['a number', 30],
            ['minutes without the T', 'P5M'],
            ['lowercase', 'pt5m'],
            ['no unit', 'PT'],
            ['only P', 'P'],
            ['a fraction', 'PT2.5M'],
            ['a negative duration', 'PT-5M'],
            ['zero', 'PT0M'],
            ['text', 'thirty minutes'],
            ['weeks', 'P1W'],
            ['months or years', 'P1Y2M'],
        ])('should give the 30 minutes of the code for a default that is %s', (_, duration) => {
            expect(arrivalTimeOf(duration)).toEqual({ key: MINUTES, count: 30 });
        });

        test('should give the default arrival time when the one of the currency is invalid', () => {
            const arrivalTimes = { defaultDuration: 'PT2H', durationByCurrency: { EUR: 'five minutes' } } as CashOutArrivalTimes;

            expect(getArrivalTime(arrivalTimes, 'EUR')).toEqual({ key: HOURS, count: 2 });
        });
    });

    test('should take 30 minutes by default', () => {
        expect(DEFAULT_ARRIVAL_DURATION).toBe('PT30M');
    });
});

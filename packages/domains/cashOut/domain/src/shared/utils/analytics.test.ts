import { describe, expect, test } from 'vitest';
import { AdyenPlatformExperienceError, ErrorTypes } from '@integration-components/core';
import type { ICashOutEligibility } from '@integration-components/types';
import {
    getAmountAnalyticsProperties,
    getAmountShare,
    getCountBucket,
    getEligibilityAnalyticsProperties,
    getErrorReturnValue,
    isWholeAmount,
} from './analytics';

const usd = (value: number) => ({ value, currency: 'USD' });

describe('getCountBucket', () => {
    // Coarse, as how many accounts there are is all that matters, not which
    test.each([
        [0, '0'],
        [1, '1'],
        [2, '2-9'],
        [9, '2-9'],
        [10, '10+'],
        [125, '10+'],
    ])('should put %i in %s', (count, bucket) => {
        expect(getCountBucket(count)).toBe(bucket);
    });
});

describe('getAmountShare', () => {
    // Coarse, as amounts themselves are not sent
    test.each([
        [1, 22000, '<25%'],
        [5499, 22000, '<25%'],
        [5500, 22000, '25-50%'],
        [10999, 22000, '25-50%'],
        [11000, 22000, '50-75%'],
        [16500, 22000, '75-100%'],
        [22000, 22000, '75-100%'],
    ])('should tell %i of %i as %s', (value, available, share) => {
        expect(getAmountShare(usd(value), usd(available))).toBe(share);
    });

    test('should tell nothing without what is available, in another currency, or above what is available', () => {
        expect(getAmountShare(usd(1000), usd(0))).toBeUndefined();
        expect(getAmountShare(usd(22001), usd(22000))).toBeUndefined();
        expect(getAmountShare(usd(1000), { value: 22000, currency: 'EUR' })).toBeUndefined();
    });
});

describe('isWholeAmount', () => {
    test('should tell whether all that is available is cashed out', () => {
        expect(isWholeAmount(usd(22000), usd(22000))).toBe(true);
        expect(isWholeAmount(usd(21999), usd(22000))).toBe(false);
        expect(isWholeAmount(usd(22000), { value: 22000, currency: 'EUR' })).toBe(false);
    });
});

describe('getAmountAnalyticsProperties', () => {
    test('should tell how much of what is available an amount is', () => {
        expect(getAmountAnalyticsProperties(usd(22000), usd(22000))).toEqual({ isWholeAmount: true, amountShare: '75-100%' });
        expect(getAmountAnalyticsProperties(usd(5000), usd(22000))).toEqual({ isWholeAmount: false, amountShare: '<25%' });
    });

    test('should tell nothing of it without an amount', () => {
        expect(getAmountAnalyticsProperties(undefined, usd(22000))).toEqual({ isWholeAmount: false, amountShare: undefined });
    });
});

describe('getErrorReturnValue', () => {
    test('should tell the error code, then the status, then the type of the error', () => {
        expect(getErrorReturnValue(new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'R1', 'failed', '29_001', undefined, '422'))).toBe('29_001');
        expect(getErrorReturnValue(new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'R1', 'failed', undefined, undefined, '500'))).toBe('500');
        expect(getErrorReturnValue(new AdyenPlatformExperienceError(ErrorTypes.NETWORK_ERROR))).toBe(ErrorTypes.NETWORK_ERROR);
        expect(getErrorReturnValue(undefined)).toBe('unknown');
    });
});

describe('getEligibilityAnalyticsProperties', () => {
    const eligibilityOf = (isCashoutAvailable: boolean, unavailableReasons: string[]) =>
        ({ availableForCashOutBalance: usd(22000), isCashoutAvailable, unavailableReasons }) as unknown as ICashOutEligibility;

    test('should tell an available cashOut and its currency', () => {
        expect(getEligibilityAnalyticsProperties(eligibilityOf(true, []))).toEqual({
            isAvailable: true,
            unavailableReason: undefined,
            currency: 'USD',
        });
    });

    test('should tell the reason an unavailable cashOut is shown with', () => {
        expect(getEligibilityAnalyticsProperties(eligibilityOf(false, ['dailyLimitReached', 'riskRestricted']))).toEqual({
            isAvailable: false,
            unavailableReason: 'dailyLimitReached',
            currency: 'USD',
        });
    });
});

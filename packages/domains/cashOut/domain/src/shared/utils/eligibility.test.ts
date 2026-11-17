import { describe, expect, test } from 'vitest';
import type { ICashOutEligibility, ICashOutUnavailableReason } from '@integration-components/types';
import {
    getAvailableAfterCashOut,
    getUnavailableReasonMessage,
    withExpectedAmount,
    withExpectedAvailableForCashOut,
    withoutUnreachableCashOut,
} from './eligibility';

const NOT_ALLOWED = 'cashOut.common.unavailableReasons.notAllowed';

const eligibilityOf = (isCashoutAvailable: boolean, unavailableReasons: string[] = [], eligibleTransferInstruments: boolean[] = [true]) =>
    ({
        isCashoutAvailable,
        unavailableReasons,
        transferInstruments: eligibleTransferInstruments.map((eligible, index) => ({ eligible, transferInstrumentId: `TI${index + 1}` })),
    }) as unknown as ICashOutEligibility;

describe('getUnavailableReasonMessage', () => {
    // A cashOut in progress and the daily limit pass with time, so they inform; the others need the user or support to act, so they warn.
    test.each<[ICashOutUnavailableReason, string, boolean, 'highlight' | 'warning']>([
        ['noInstantReachableTransferInstruments', 'cashOut.common.unavailableReasons.noInstantReachableTransferInstruments', false, 'warning'],
        ['cashOutInProgress', 'cashOut.common.unavailableReasons.cashOutInProgress', false, 'highlight'],
        ['dailyLimitReached', 'cashOut.common.unavailableReasons.dailyLimitReached', false, 'highlight'],
        ['sendToBalanceAccountNotAllowed', NOT_ALLOWED, true, 'warning'],
        ['receiveFromBalanceAccountNotAllowed', NOT_ALLOWED, true, 'warning'],
        ['sendToTransferInstrumentNotAllowed', NOT_ALLOWED, true, 'warning'],
        ['riskRestricted', 'cashOut.common.unavailableReasons.riskRestricted', false, 'warning'],
        ['cashOutNotConfigured', NOT_ALLOWED, true, 'warning'],
    ])('should explain %s, offering contact support only when support can help', (reason, key, offersContactSupport, type) => {
        expect(getUnavailableReasonMessage(eligibilityOf(false, [reason]))).toEqual({ key, offersContactSupport, type });
    });

    test('should give no message for a zero balance, which already shows as an amount of 0', () => {
        expect(getUnavailableReasonMessage(eligibilityOf(false, ['zeroBalance']))).toBeUndefined();
    });

    test('should give no message while cashOut is available', () => {
        expect(getUnavailableReasonMessage(eligibilityOf(true))).toBeUndefined();
    });

    test('should fall back to the general message without a reason, or for one it does not know', () => {
        expect(getUnavailableReasonMessage(eligibilityOf(false))).toEqual({ key: NOT_ALLOWED, offersContactSupport: true, type: 'warning' });
        expect(getUnavailableReasonMessage(eligibilityOf(false, ['someNewReason']))).toEqual({
            key: NOT_ALLOWED,
            offersContactSupport: true,
            type: 'warning',
        });
    });
});

describe('withoutUnreachableCashOut', () => {
    test('should keep an available cashOut that an account can receive', () => {
        const eligibility = eligibilityOf(true, [], [false, true]);

        expect(withoutUnreachableCashOut(eligibility)).toBe(eligibility);
    });

    test('should report an available cashOut that no account can receive as unavailable', () => {
        const eligibility = eligibilityOf(true, [], [false, false]);

        expect(withoutUnreachableCashOut(eligibility)).toEqual({
            ...eligibility,
            isCashoutAvailable: false,
            unavailableReasons: ['noInstantReachableTransferInstruments'],
        });
    });

    test('should keep an unavailable cashOut and its reasons', () => {
        const eligibility = eligibilityOf(false, ['dailyLimitReached'], []);

        expect(withoutUnreachableCashOut(eligibility)).toBe(eligibility);
    });

    test('should pass on a missing eligibility', () => {
        expect(withoutUnreachableCashOut(undefined)).toBeUndefined();
    });
});

describe('getAvailableAfterCashOut', () => {
    const euro = (value: number) => ({ value, currency: 'EUR' });

    test('should lower what is available by the amount cashed out, the fee being taken out of it', () => {
        expect(getAvailableAfterCashOut(euro(22000), euro(10000))).toEqual(euro(12000));
    });

    test('should not go below 0', () => {
        expect(getAvailableAfterCashOut(euro(5000), euro(10000))).toEqual(euro(0));
    });

    test('should keep what is available for a cashOut in another currency', () => {
        expect(getAvailableAfterCashOut(euro(22000), { value: 10000, currency: 'USD' })).toEqual(euro(22000));
    });
});

describe('withExpectedAmount', () => {
    const euro = (value: number) => ({ value, currency: 'EUR' });

    test('should be what is expected while the API still shows more, and what the API shows otherwise', () => {
        expect(withExpectedAmount(euro(22000), euro(12000))).toEqual(euro(12000));
        expect(withExpectedAmount(euro(10000), euro(12000))).toEqual(euro(10000));
    });

    test('should be what the API shows without an expected amount, or with one in another currency', () => {
        expect(withExpectedAmount(euro(22000), undefined)).toEqual(euro(22000));
        expect(withExpectedAmount(euro(22000), { value: 100, currency: 'USD' })).toEqual(euro(22000));
        expect(withExpectedAmount(undefined, euro(100))).toBeUndefined();
    });
});

describe('withExpectedAvailableForCashOut', () => {
    const available = (value: number, overrides: Partial<ICashOutEligibility> = {}) =>
        ({ ...eligibilityOf(true), availableForCashOutBalance: { value, currency: 'EUR' }, ...overrides }) as ICashOutEligibility;
    const expected = (value: number) => ({ value, currency: 'EUR' });

    test('should show what is expected when the API still shows more', () => {
        expect(withExpectedAvailableForCashOut(available(22000), expected(12000))?.availableForCashOutBalance).toEqual(expected(12000));
    });

    test('should show what the API shows once it is no more than what is expected', () => {
        const eligibility = available(10000);
        expect(withExpectedAvailableForCashOut(eligibility, expected(12000))).toBe(eligibility);
    });

    test('should keep the unavailable reasons of the API', () => {
        const eligibility = available(22000, { isCashoutAvailable: false, unavailableReasons: ['cashOutInProgress'] });
        expect(withExpectedAvailableForCashOut(eligibility, expected(12000))).toEqual({
            ...eligibility,
            availableForCashOutBalance: expected(12000),
        });
    });

    test('should make a cashOut unavailable when nothing is expected to be left', () => {
        expect(withExpectedAvailableForCashOut(available(22000), expected(0))).toEqual({
            ...available(22000),
            availableForCashOutBalance: expected(0),
            isCashoutAvailable: false,
            unavailableReasons: ['zeroBalance'],
        });
    });

    test('should keep the eligibility without an expected amount, or with one in another currency', () => {
        const eligibility = available(22000);
        expect(withExpectedAvailableForCashOut(eligibility, undefined)).toBe(eligibility);
        expect(withExpectedAvailableForCashOut(eligibility, { value: 100, currency: 'USD' })).toBe(eligibility);
        expect(withExpectedAvailableForCashOut(undefined, expected(100))).toBeUndefined();
    });
});

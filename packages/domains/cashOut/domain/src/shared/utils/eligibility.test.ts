import { describe, expect, test } from 'vitest';
import type { ICashOutEligibility, ICashOutUnavailableReason } from '@integration-components/types';
import { getUnavailableReasonMessage, withoutUnreachableCashOut } from './eligibility';

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

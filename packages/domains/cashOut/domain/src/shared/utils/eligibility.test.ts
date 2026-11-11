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
    test.each<[ICashOutUnavailableReason, string, boolean]>([
        ['noInstantReachableTransferInstruments', 'cashOut.common.unavailableReasons.noInstantReachableTransferInstruments', false],
        ['cashOutInProgress', 'cashOut.common.unavailableReasons.cashOutInProgress', false],
        ['dailyLimitReached', 'cashOut.common.unavailableReasons.dailyLimitReached', false],
        ['sendToBalanceAccountNotAllowed', NOT_ALLOWED, true],
        ['receiveFromBalanceAccountNotAllowed', NOT_ALLOWED, true],
        ['riskRestricted', 'cashOut.common.unavailableReasons.riskRestricted', false],
        ['cashOutNotConfigured', NOT_ALLOWED, true],
    ])('should explain %s, offering contact support only when support can help', (reason, key, offersContactSupport) => {
        expect(getUnavailableReasonMessage(eligibilityOf(false, [reason]))).toEqual({ key, offersContactSupport });
    });

    test('should give no message for a zero balance, which already shows as an amount of 0', () => {
        expect(getUnavailableReasonMessage(eligibilityOf(false, ['zeroBalance']))).toBeUndefined();
    });

    test('should give no message while cashOut is available', () => {
        expect(getUnavailableReasonMessage(eligibilityOf(true))).toBeUndefined();
    });

    test('should fall back to the general message without a reason, or for one it does not know', () => {
        expect(getUnavailableReasonMessage(eligibilityOf(false))).toEqual({ key: NOT_ALLOWED, offersContactSupport: true });
        expect(getUnavailableReasonMessage(eligibilityOf(false, ['someNewReason']))).toEqual({ key: NOT_ALLOWED, offersContactSupport: true });
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

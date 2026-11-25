import { describe, expect, test } from 'vitest';
import { AdyenPlatformExperienceError, ErrorTypes } from '@integration-components/core';
import { COMMON_CASH_OUT_ERROR_MESSAGE, getCashOutErrorMessage, isAmountAboveAvailableBalanceError } from './errors';

const REFRESH_ERROR = {
    title: COMMON_CASH_OUT_ERROR_MESSAGE.somethingWentWrong,
    messages: [COMMON_CASH_OUT_ERROR_MESSAGE.couldNotLoadCashOut, COMMON_CASH_OUT_ERROR_MESSAGE.tryRefreshingThePage],
    refreshComponent: true,
};

const createAdyenPlatformExperienceError = (errorCode?: string) =>
    new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'request-id', 'Test error message', errorCode);

describe('getCashOutErrorMessage', () => {
    test('offers a refresh when there is no error', () => {
        expect(getCashOutErrorMessage(undefined)).toEqual(REFRESH_ERROR);
    });

    test('offers a refresh for an error without an error code', () => {
        expect(getCashOutErrorMessage(createAdyenPlatformExperienceError())).toEqual(REFRESH_ERROR);
    });

    test.each(['00_500', '500', '00_403', '403', '00_404', '404', '00_429', '429', 'unknown_code'])(
        'offers a refresh without contact support or error code for a %s error',
        errorCode => {
            expect(getCashOutErrorMessage(createAdyenPlatformExperienceError(errorCode))).toEqual(REFRESH_ERROR);
        }
    );
});

describe('isAmountAboveAvailableBalanceError', () => {
    const errorWithInvalidFields = (invalidFields?: { name: string; message: string; value: string }[]) =>
        new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'request-id', 'Rejected', '14_030', invalidFields, '422');

    // Like cashout-ui, which rejects an amount above what can be cashed out by then, as what is available changed since it was shown
    test('should tell an error of an amount above what is available', () => {
        expect(isAmountAboveAvailableBalanceError(errorWithInvalidFields([{ name: 'amount', message: 'exceedsAvailableBalance', value: '' }]))).toBe(
            true
        );
    });

    test('should not tell other errors', () => {
        expect(isAmountAboveAvailableBalanceError(undefined)).toBe(false);
        expect(isAmountAboveAvailableBalanceError(errorWithInvalidFields())).toBe(false);
        expect(isAmountAboveAvailableBalanceError(errorWithInvalidFields([]))).toBe(false);
        expect(isAmountAboveAvailableBalanceError(errorWithInvalidFields([{ name: 'amount', message: 'required', value: '' }]))).toBe(false);
        expect(
            isAmountAboveAvailableBalanceError(errorWithInvalidFields([{ name: 'currency', message: 'exceedsAvailableBalance', value: '' }]))
        ).toBe(false);
    });
});

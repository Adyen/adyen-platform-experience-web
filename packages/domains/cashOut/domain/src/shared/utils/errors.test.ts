import { describe, expect, test } from 'vitest';
import { AdyenPlatformExperienceError, ErrorTypes } from '@integration-components/core';
import { COMMON_CASH_OUT_ERROR_MESSAGE, getCashOutErrorMessage } from './errors';

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

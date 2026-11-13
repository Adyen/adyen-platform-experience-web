import { describe, expect, test, vi } from 'vitest';
import { AdyenErrorResponse, AdyenPlatformExperienceError, ErrorTypes } from '@integration-components/core';
import { COMMON_CAPITAL_ERROR_MESSAGE, getBalanceAccountErrorMessage, getCapitalErrorMessage, getCapitalErrorConfig } from './errors';

const UNKNOWN_ERROR = {
    title: COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong,
    message: [COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, COMMON_CAPITAL_ERROR_MESSAGE.tryRefreshingThePage],
    refreshComponent: true,
};

const createAdyenErrorResponse = (status: number, errorCode?: string, requestId = 'request-id') => {
    return { errorCode, detail: 'detail', type: 'ERROR', status: 422, requestId } as AdyenErrorResponse;
};

const createAdyenPlatformExperienceError = (errorCode?: string, requestId = 'request-id') =>
    new AdyenPlatformExperienceError(ErrorTypes.ERROR, requestId, 'Test error message', errorCode);

describe('getCapitalErrorMessage', () => {
    test('returns the unknown error message when no error is provided', () => {
        expect(getCapitalErrorMessage(undefined)).toEqual(UNKNOWN_ERROR);
    });

    test('retains the support callback for errors without an error code', () => {
        const onContactSupport = vi.fn();

        expect(getCapitalErrorMessage(createAdyenPlatformExperienceError(), onContactSupport)).toEqual({
            ...UNKNOWN_ERROR,
            onContactSupport,
        });
    });

    test('returns the unknown error message for unrecognized error codes', () => {
        expect(getCapitalErrorMessage(createAdyenPlatformExperienceError('unknown_code'))).toEqual(UNKNOWN_ERROR);
    });

    test.each([
        ['30_016', COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong, COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers],
        ['30_011', 'capital.offer.errors.accountInactive', COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers],
        ['30_600', COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong, 'capital.offer.errors.cannotContinue'],
    ])('returns a specific message with support callback for error code %s', (errorCode, title, firstMessage) => {
        const onContactSupport = vi.fn();

        expect(getCapitalErrorMessage(createAdyenPlatformExperienceError(errorCode), onContactSupport)).toEqual({
            title,
            message: [firstMessage, 'capital.common.errors.errorCode'],
            translationValues: { 'capital.common.errors.errorCode': 'request-id' },
            onContactSupport,
        });
    });

    test('uses a different message when no contact callback is available', () => {
        expect(getCapitalErrorMessage(createAdyenPlatformExperienceError('30_016'))).toEqual({
            title: COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong,
            message: [COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, 'capital.common.errors.errorCodeSupport'],
            translationValues: { 'capital.common.errors.errorCodeSupport': 'request-id' },
            onContactSupport: undefined,
        });
    });

    test('omits translation values when a capital error has no request ID', () => {
        expect(getCapitalErrorMessage(createAdyenPlatformExperienceError('30_011', ''))).toEqual({
            title: 'capital.offer.errors.accountInactive',
            message: [COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, 'capital.common.errors.errorCodeSupport'],
            translationValues: undefined,
            onContactSupport: undefined,
        });
    });
});

describe('getCapitalErrorConfig', () => {
    test('normalizes single and multiple messages into an array', () => {
        const onContactSupport = vi.fn();
        expect(getCapitalErrorConfig(createAdyenPlatformExperienceError('30_016'), onContactSupport)).toMatchObject({
            messages: [COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, 'capital.common.errors.errorCode'],
        });
    });

    test('maps common translation keys to the capital namespace', () => {
        expect(getCapitalErrorConfig(createAdyenPlatformExperienceError('30_016'), vi.fn())).toMatchObject({
            title: 'capital.common.errors.somethingWentWrong',
            messages: ['capital.offer.errors.unavailable', 'capital.common.errors.errorCode'],
        });
    });

    test('extracts the request ID and preserves the error metadata', () => {
        const onContactSupport = vi.fn();

        expect(getCapitalErrorConfig(createAdyenPlatformExperienceError('30_016'), onContactSupport)).toEqual({
            title: 'capital.common.errors.somethingWentWrong',
            messages: [COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, 'capital.common.errors.errorCode'],
            requestId: 'request-id',
            onContactSupport,
        });
    });
});

describe('getBalanceAccountErrorMessage', () => {
    test('returns balance account error message when error code is 30_013', () => {
        expect(getBalanceAccountErrorMessage(createAdyenErrorResponse(422, '30_013'))).toEqual({
            title: 'capital.offer.errors.noPrimaryAccount',
            message: 'capital.offer.errors.cannotContinueSupport',
        });
    });

    test('returns undefined if error code is different than 30_013', () => {
        expect(getBalanceAccountErrorMessage(createAdyenErrorResponse(422, '30_010'))).toBeUndefined();
    });

    test('returns undefined if error is undefined', () => {
        expect(getBalanceAccountErrorMessage(undefined)).toBeUndefined();
    });
});

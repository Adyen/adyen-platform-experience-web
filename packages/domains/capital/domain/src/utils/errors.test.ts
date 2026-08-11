import { describe, expect, test, vi } from 'vitest';
import { AdyenPlatformExperienceError, ErrorTypes } from '@integration-components/core';
import { COMMON_CAPITAL_ERROR_MESSAGE, getCapitalErrorMessage } from './errors';

const UNKNOWN_ERROR = {
    title: COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong,
    message: [COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, COMMON_CAPITAL_ERROR_MESSAGE.tryRefreshingThePage],
    refreshComponent: true,
};

const createError = (errorCode?: string, requestId = 'request-id') =>
    new AdyenPlatformExperienceError(ErrorTypes.ERROR, requestId, 'Test error message', errorCode);

describe('getCapitalErrorMessage', () => {
    test('returns the unknown error message when no error is provided', () => {
        expect(getCapitalErrorMessage(undefined)).toEqual(UNKNOWN_ERROR);
    });

    test('returns the common error message when the error has a common error code', () => {
        expect(getCapitalErrorMessage(createError('29_001'))).toEqual({
            title: 'common.errors.requestInvalid',
            message: ['common.errors.contactSupport'],
        });
    });

    test('retains the support callback for errors without an error code', () => {
        const onContactSupport = vi.fn();

        expect(getCapitalErrorMessage(createError(), onContactSupport)).toEqual({
            ...UNKNOWN_ERROR,
            onContactSupport,
        });
    });

    test('returns the unknown error message for unrecognized error codes', () => {
        expect(getCapitalErrorMessage(createError('unknown_code'))).toEqual(UNKNOWN_ERROR);
    });

    test.each([
        ['NO_OFFER', 'capital.offer.common.noOfferTitle', 'capital.offer.common.noOfferDescription'],
        ['UNSUPPORTED_REGION', 'capital.common.errors.unsupportedRegion.title', 'capital.common.errors.unsupportedRegion'],
    ])('returns a specific message for error code %s', (errorCode, title, message) => {
        expect(getCapitalErrorMessage(createError(errorCode))).toEqual({ title, message });
    });

    test.each([
        ['30_016', COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong, COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers],
        ['30_011', 'capital.offer.common.errors.accountInactive', COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers],
        ['30_600', COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong, 'capital.offer.common.errors.cannotContinue'],
    ])('returns a specific message with support callback for error code %s', (errorCode, title, firstMessage) => {
        const onContactSupport = vi.fn();

        expect(getCapitalErrorMessage(createError(errorCode), onContactSupport)).toEqual({
            title,
            message: [firstMessage, 'common.errors.errorCode'],
            translationValues: { 'common.errors.errorCode': 'request-id' },
            onContactSupport,
        });
    });

    test('uses a different message when no contact callback is available', () => {
        expect(getCapitalErrorMessage(createError('30_016'))).toEqual({
            title: COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong,
            message: [COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, 'common.errors.errorCodeSupport'],
            translationValues: { 'common.errors.errorCodeSupport': 'request-id' },
            onContactSupport: undefined,
        });
    });

    test('omits translation values when a capital error has no request ID', () => {
        expect(getCapitalErrorMessage(createError('30_011', ''))).toEqual({
            title: 'capital.offer.common.errors.accountInactive',
            message: [COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, 'common.errors.errorCodeSupport'],
            translationValues: undefined,
            onContactSupport: undefined,
        });
    });
});

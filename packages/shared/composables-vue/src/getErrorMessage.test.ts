import { describe, expect, test, vi } from 'vitest';
import { getErrorMessage, type ErrorWithCode } from './getErrorMessage';

const errorWithCode = (errorCode?: string, requestId?: string) =>
    Object.assign(new Error('Request failed'), { errorCode, requestId }) as ErrorWithCode;
const errorMessage = 'transactions.overview.errors.unavailable';
const notFoundMessage = 'transactions.details.errors.notFound';

describe('getErrorMessage', () => {
    test('returns the unexpected error when no error or an unknown code is provided', () => {
        const unexpectedError = {
            title: 'common.errors.unexpected',
            messages: ['common.errors.contactSupport'],
        };

        expect(getErrorMessage(undefined, errorMessage)).toEqual(unexpectedError);
        expect(getErrorMessage(errorWithCode('UNKNOWN'), errorMessage)).toEqual(unexpectedError);
        expect(getErrorMessage(errorWithCode('00_403'), errorMessage)).toEqual(unexpectedError);
    });

    test('maps invalid and missing resources to their specific messages', () => {
        const onContactSupport = vi.fn();

        expect(getErrorMessage(errorWithCode('29_001'), errorMessage, onContactSupport)).toEqual({
            title: 'common.errors.requestInvalid',
            messages: ['common.errors.contactSupport'],
            onContactSupport,
        });
        expect(getErrorMessage(errorWithCode('30_112'), errorMessage, onContactSupport, notFoundMessage)).toEqual({
            title: 'common.errors.notFound',
            messages: [notFoundMessage],
            onContactSupport,
        });
    });

    test('makes uncoded errors refreshable', () => {
        expect(getErrorMessage(new Error('Network failure'), errorMessage)).toEqual({
            title: 'common.errors.somethingWentWrong',
            messages: [errorMessage, 'common.errors.retry'],
            refreshComponent: true,
        });
    });

    test('includes request details and support behavior for server errors', () => {
        const onContactSupport = vi.fn();
        const error = errorWithCode('00_500', 'request-id');

        expect(getErrorMessage(error, errorMessage, onContactSupport)).toEqual({
            title: 'common.errors.somethingWentWrong',
            messages: [errorMessage, 'common.errors.errorCode'],
            onContactSupport,
            requestId: 'request-id',
        });
        expect(getErrorMessage(error, errorMessage)).toEqual({
            title: 'common.errors.somethingWentWrong',
            messages: [errorMessage, 'common.errors.errorCodeSupport'],
            onContactSupport: undefined,
            requestId: 'request-id',
        });
    });
});

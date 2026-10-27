import { describe, expect, test, vi } from 'vitest';
import { getErrorMessage, type ErrorWithCode } from './getErrorMessage';

const errorWithCode = (errorCode?: string, requestId?: string) =>
    Object.assign(new Error('Request failed'), { errorCode, requestId }) as ErrorWithCode;
const domain = 'transactions';
const errorMessage = 'transactions.overview.errors.unavailable';
const notFoundMessage = 'transactions.details.errors.notFound';

describe('getErrorMessage', () => {
    test('returns the unexpected error when no error or an unknown code is provided', () => {
        const unexpectedError = {
            title: 'transactions.common.errors.unexpected',
            messages: ['transactions.common.errors.contactSupport'],
        };

        expect(getErrorMessage(undefined, errorMessage, domain)).toEqual(unexpectedError);
        expect(getErrorMessage(errorWithCode('UNKNOWN'), errorMessage, domain)).toEqual(unexpectedError);
        expect(getErrorMessage(errorWithCode('00_403'), errorMessage, domain)).toEqual(unexpectedError);
    });

    test('maps invalid and missing resources to their specific messages', () => {
        const onContactSupport = vi.fn();

        expect(getErrorMessage(errorWithCode('29_001'), errorMessage, domain, onContactSupport)).toEqual({
            title: 'transactions.common.errors.requestInvalid',
            messages: ['transactions.common.errors.contactSupport'],
            onContactSupport,
        });
        expect(getErrorMessage(errorWithCode('30_112'), errorMessage, domain, onContactSupport, notFoundMessage)).toEqual({
            title: 'transactions.common.errors.notFound',
            messages: [notFoundMessage],
            onContactSupport,
        });
    });

    test('makes uncoded errors refreshable', () => {
        expect(getErrorMessage(new Error('Network failure'), errorMessage, domain)).toEqual({
            title: 'transactions.common.errors.somethingWentWrong',
            messages: [errorMessage, 'transactions.common.errors.retry'],
            refreshComponent: true,
        });
    });

    test('includes request details and support behavior for server errors', () => {
        const onContactSupport = vi.fn();
        const error = errorWithCode('00_500', 'request-id');

        expect(getErrorMessage(error, errorMessage, domain, onContactSupport)).toEqual({
            title: 'transactions.common.errors.somethingWentWrong',
            messages: [errorMessage, 'transactions.common.errors.errorCode'],
            onContactSupport,
            requestId: 'request-id',
        });
        expect(getErrorMessage(error, errorMessage, domain)).toEqual({
            title: 'transactions.common.errors.somethingWentWrong',
            messages: [errorMessage, 'transactions.common.errors.errorCodeSupport'],
            onContactSupport: undefined,
            requestId: 'request-id',
        });
    });
});

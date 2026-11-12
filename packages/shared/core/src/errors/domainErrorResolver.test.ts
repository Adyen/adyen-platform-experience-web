import { describe, expect, test, vi } from 'vitest';
import { createDomainErrorResolver, type DomainErrorVocabulary, type ErrorWithCode } from './domainErrorResolver';

const errorWithCode = (errorCode?: string, requestId?: string) =>
    Object.assign(new Error('Request failed'), { errorCode, requestId }) as ErrorWithCode;

const vocabulary = {
    contactSupport: 'transactions.common.errors.contactSupport',
    errorCode: 'transactions.common.errors.errorCode',
    errorCodeSupport: 'transactions.common.errors.errorCodeSupport',
    notFound: 'transactions.common.errors.notFound',
    requestInvalid: 'transactions.common.errors.requestInvalid',
    retry: 'transactions.common.errors.retry',
    somethingWentWrong: 'transactions.common.errors.somethingWentWrong',
    unexpected: 'transactions.common.errors.unexpected',
} as const satisfies DomainErrorVocabulary;

const resolve = createDomainErrorResolver(vocabulary);
const errorMessage = 'transactions.overview.errors.unavailable';
const notFoundMessage = 'transactions.details.errors.notFound';

describe('createDomainErrorResolver', () => {
    test('returns the unexpected error when no error or an unknown code is provided', () => {
        const unexpectedError = {
            title: 'transactions.common.errors.unexpected',
            messages: ['transactions.common.errors.contactSupport'],
        };

        expect(resolve(undefined, { errorMessage })).toEqual(unexpectedError);
        expect(resolve(errorWithCode('UNKNOWN'), { errorMessage })).toEqual(unexpectedError);
        expect(resolve(errorWithCode('00_403'), { errorMessage })).toEqual(unexpectedError);
    });

    test('maps invalid and missing resources to their specific messages', () => {
        const onContactSupport = vi.fn();

        expect(resolve(errorWithCode('29_001'), { errorMessage, onContactSupport })).toEqual({
            title: 'transactions.common.errors.requestInvalid',
            messages: ['transactions.common.errors.contactSupport'],
            onContactSupport,
        });
        expect(resolve(errorWithCode('30_112'), { errorMessage, notFoundMessage, onContactSupport })).toEqual({
            title: 'transactions.common.errors.notFound',
            messages: [notFoundMessage],
            onContactSupport,
        });
    });

    test('falls back to the error message when no not-found message is given', () => {
        expect(resolve(errorWithCode('30_112'), { errorMessage })).toEqual({
            title: 'transactions.common.errors.notFound',
            messages: [errorMessage],
            onContactSupport: undefined,
        });
    });

    test('makes uncoded errors refreshable', () => {
        expect(resolve(new Error('Network failure'), { errorMessage })).toEqual({
            title: 'transactions.common.errors.somethingWentWrong',
            messages: [errorMessage, 'transactions.common.errors.retry'],
            refreshComponent: true,
        });
    });

    test('includes request details and support behavior for server errors', () => {
        const onContactSupport = vi.fn();
        const error = errorWithCode('00_500', 'request-id');

        expect(resolve(error, { errorMessage, onContactSupport })).toEqual({
            title: 'transactions.common.errors.somethingWentWrong',
            messages: [errorMessage, 'transactions.common.errors.errorCode'],
            onContactSupport,
            requestId: 'request-id',
        });
        expect(resolve(error, { errorMessage })).toEqual({
            title: 'transactions.common.errors.somethingWentWrong',
            messages: [errorMessage, 'transactions.common.errors.errorCodeSupport'],
            onContactSupport: undefined,
            requestId: 'request-id',
        });
    });

    test('takes its copy from the vocabulary rather than from the shared layer', () => {
        const disputesResolver = createDomainErrorResolver({
            ...vocabulary,
            notFound: 'disputes.common.errors.notFound',
        } as const satisfies DomainErrorVocabulary);

        expect(disputesResolver(errorWithCode('30_112'), { errorMessage: 'disputes.overview.errors.listUnavailable' })).toEqual({
            title: 'disputes.common.errors.notFound',
            messages: ['disputes.overview.errors.listUnavailable'],
            onContactSupport: undefined,
        });
    });
});

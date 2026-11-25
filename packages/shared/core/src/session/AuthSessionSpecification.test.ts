import { afterEach, describe, expect, test, vi } from 'vitest';
import { AuthSessionSpecification } from './AuthSessionSpecification';
import { isSessionExpiredError } from './SessionContext';
import { ErrorTypes } from '../Http/utils';
import { http } from '../Http/http';

vi.mock('../Http/http', () => ({ http: vi.fn() }));

const constants = vi.hoisted(() => ({ maxAgeMs: undefined as number | undefined }));

vi.mock('./constants', async importOriginal => ({
    ...(await importOriginal<typeof import('./constants')>()),
    get MAX_AGE_MS() {
        return constants.maxAgeMs;
    },
}));

describe('AuthSessionSpecification', () => {
    const session = { id: 'session-id', token: 'session-token' };
    const callHttp = () =>
        new AuthSessionSpecification().http!(session, new AbortController().signal, { method: 'GET', path: '/balances' }).catch((ex: unknown) => ex);

    test('should rethrow expired-token errors as-is and mark them as session expiry', async () => {
        const unauthorized = Object.assign(new Error('Unauthorized'), { type: ErrorTypes.EXPIRED_TOKEN });
        vi.mocked(http).mockRejectedValueOnce(unauthorized);

        const error = await callHttp();

        expect(error).toBe(unauthorized);
        expect(isSessionExpiredError(error)).toBe(true);
    });

    test('should not mark other errors as session expiry', async () => {
        const serverError = Object.assign(new Error('Server error'), { type: ErrorTypes.HTTP_ERROR });
        vi.mocked(http).mockRejectedValueOnce(serverError);

        const error = await callHttp();

        expect(error).toBe(serverError);
        expect(isSessionExpiredError(error)).toBe(false);
    });
    describe('deadline', () => {
        const nowInSeconds = Math.floor(Date.now() / 1000);
        const tokens = {
            'readable token': `header.${btoa(JSON.stringify({ iat: nowInSeconds, exp: nowInSeconds + 3600 }))}.signature`,
            'encrypted token': 'encrypted-header.encrypted-key.iv.ciphertext.tag',
        };

        const getDeadline = (token: string) =>
            (new AuthSessionSpecification().deadline as (...args: unknown[]) => unknown)({ id: 'session-id', token }, new AbortController().signal);

        afterEach(() => {
            constants.maxAgeMs = undefined;
            vi.useRealTimers();
        });

        for (const [name, token] of Object.entries(tokens)) {
            test(`should not derive a deadline from the token (${name})`, () => {
                expect(getDeadline(token)).toEqual([]);
            });

            test(`should expire the session the configured max age after it is received (${name})`, () => {
                vi.useFakeTimers({ now: new Date('2026-01-01T00:00:00Z') });
                constants.maxAgeMs = 60_000;
                expect(getDeadline(token)).toEqual([Date.now() + 60_000]);
            });
        }
    });
});

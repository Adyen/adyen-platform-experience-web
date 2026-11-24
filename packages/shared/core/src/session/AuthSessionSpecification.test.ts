import { describe, expect, test, vi } from 'vitest';
import { AuthSessionSpecification } from './AuthSessionSpecification';
import { isSessionExpiredError } from './SessionContext';
import { ErrorTypes } from '../Http/utils';
import { http } from '../Http/http';

vi.mock('../Http/http', () => ({ http: vi.fn() }));

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
});

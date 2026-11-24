// @vitest-environment jsdom
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { SessionContext } from './SessionContext';
import { setupTimers } from '@integration-components/utils/primitives/time/__testing__/fixtures';
import { ERR_SESSION_EXPIRED, EVT_SESSION_READY, EVT_SESSION_REFRESHED, EVT_SESSION_REFRESHING_END, EVT_SESSION_REFRESHING_START } from './constants';
import { asSessionExpiredError } from './errors';
import { augmentSpecificationContext, SpecificationContext } from './__testing__/fixtures';
import { waitForTicks } from './__testing__/utils';
import { noop } from '@integration-components/utils';
import { AuthSessionSpecification } from '../AuthSessionSpecification';
import type { SessionEventType } from './types';

describe('SessionContext', () => {
    setupTimers();

    type SessionTestContext = SpecificationContext & {
        eventSequence: (events: SessionEventType[]) => {
            readonly expectationsAtIndex: (index?: number) => void;
            readonly unlisten: () => void;
        };
        session: SessionContext<any>;
    };

    beforeEach<SessionTestContext>(ctx => {
        augmentSpecificationContext(ctx);
        ctx.session = new SessionContext(ctx._specification);

        ctx.eventSequence = events => {
            const _sequence = [...events] as const;
            const _emitted = _sequence.map(() => false);

            const expectationsAtIndex = (sequenceIndex = -1) => {
                for (let i = 0; i < _emitted.length; i++) {
                    expect(_emitted[i]).toBe(i <= sequenceIndex);
                }
            };

            const unlisten =
                (function _registerEvent(index = 0) {
                    if (index >= _sequence.length) return;
                    const unlisten = ctx.session.on(_sequence[index]!, () => {
                        _registerEvent(index + 1);
                        _emitted[index] = true;
                        if (index > 0) unlisten();
                    });
                    return unlisten;
                })() ?? noop;

            return { expectationsAtIndex, unlisten } as const;
        };
    });

    test<SessionTestContext>('should create session context', async ctx => {
        const { session } = ctx;
        expect(session.isExpired).toBeUndefined();
        expect(session.refreshing).toBe(false);

        const refreshPromise = session.refresh().catch(() => {});
        expect(session.isExpired).toBeUndefined();
        expect(session.refreshing).toBe(true);

        await refreshPromise;
        expect(session.isExpired).toBeUndefined();
        expect(session.refreshing).toBe(false);
    });

    test<SessionTestContext>('should emit events in the right sequence', async ctx => {
        const { eventSequence, session } = ctx;
        const _eventSequence = eventSequence([EVT_SESSION_REFRESHING_START, EVT_SESSION_READY, EVT_SESSION_REFRESHING_END, EVT_SESSION_REFRESHED]);

        const refreshPromise = session.refresh().catch(() => {});
        _eventSequence.expectationsAtIndex();

        await waitForTicks();
        _eventSequence.expectationsAtIndex(0); // EVT_SESSION_REFRESHING_START

        await refreshPromise;
        _eventSequence.expectationsAtIndex(2); // EVT_SESSION_READY + EVT_SESSION_REFRESHING_END

        await waitForTicks();
        _eventSequence.expectationsAtIndex(3); // EVT_SESSION_REFRESHED
    });

    test<SessionTestContext>('should not retry indefinitely when a refreshed session keeps getting expired-token responses', async ctx => {
        const { patchSpecification, session } = ctx;
        const ERR_RETRY_GUARD = Symbol('retry-guard');
        const RETRY_GUARD_LIMIT = 20;
        let httpCalls = 0;

        patchSpecification('autoRefresh', () => false);
        patchSpecification('onRefresh', () => () => ({ id: 'session-id', token: 'session-token' }));
        patchSpecification('deadline', () => () => Date.now() + 60 * 60 * 1000);
        patchSpecification('http', () => () => {
            // Escape hatch: the retry loop only awaits microtasks, so an unbounded loop
            // would starve the test runner's timeout instead of failing the test.
            if (++httpCalls > RETRY_GUARD_LIMIT) throw ERR_RETRY_GUARD;
            throw ERR_SESSION_EXPIRED;
        });

        await session.refresh().catch(noop);
        await waitForTicks(5);

        const error = await session.http(null).catch(ex => ex);

        expect(error).not.toBe(ERR_RETRY_GUARD);
        expect(httpCalls).toBeLessThanOrEqual(2);
    });

    describe('expired-token recovery', () => {
        type RecoveryTestContext = SessionTestContext & {
            httpCalls: number;
            refreshes: number;
            respondWith: (...outcomes: unknown[]) => void;
            startSession: () => Promise<void>;
        };

        const OK = Symbol('ok');

        beforeEach<RecoveryTestContext>(ctx => {
            const outcomes: unknown[] = [];
            ctx.httpCalls = 0;
            ctx.refreshes = 0;
            ctx.respondWith = (...next) => void outcomes.push(...next);

            ctx.patchSpecification('autoRefresh', () => false);
            ctx.patchSpecification('onRefresh', () => () => ({ id: `session-${++ctx.refreshes}`, token: 'token' }));
            ctx.patchSpecification('deadline', () => () => Date.now() + 60 * 60 * 1000);
            ctx.patchSpecification('http', () => async (_session: unknown, signal: AbortSignal) => {
                // Escape hatch against an unbounded retry loop (see above)
                if (++ctx.httpCalls > 20) throw new Error('retry guard');
                if (signal.aborted) throw new Error('aborted');
                const outcome = outcomes.length ? outcomes.shift() : OK;
                if (outcome !== OK) throw outcome;
                return 'data';
            });

            ctx.startSession = async () => {
                await ctx.session.refresh().catch(noop);
                await waitForTicks(5);
            };
        });

        test<RecoveryTestContext>('should refresh the session once and retry when auto-refresh is disabled', async ctx => {
            await ctx.startSession();
            ctx.respondWith(ERR_SESSION_EXPIRED);

            await expect(ctx.session.http(null)).resolves.toBe('data');
            expect(ctx.httpCalls).toBe(2);
            expect(ctx.refreshes).toBe(2);
        });

        test<RecoveryTestContext>('should release the rejected session after each successful recovery', async ctx => {
            ctx.patchSpecification('reauthThrottleMs', () => 0);
            await ctx.startSession();

            for (let i = 0; i < 2; i++) {
                ctx.respondWith(ERR_SESSION_EXPIRED);
                await expect(ctx.session.http(null)).resolves.toBe('data');
                expect(ctx.session).toHaveProperty('_rejectedSession', undefined);
                expect(ctx.session.isExpired).toBe(false);
            }
            expect(ctx.refreshes).toBe(3);
        });

        for (const reuseSessionObject of [true, false]) {
            test<RecoveryTestContext>(`should retain rejection after failed refresh and clear it after successful explicit refresh (reuse object: ${reuseSessionObject})`, async ctx => {
                const originalSession = { id: 'session-id', token: 'token' };
                ctx.patchSpecification('onRefresh', () => () => originalSession);
                await ctx.startSession();

                const refreshError = new Error('session refresh failed');
                ctx.patchSpecification('onRefresh', () => () => {
                    throw refreshError;
                });
                ctx.respondWith(ERR_SESSION_EXPIRED);
                await expect(ctx.session.http(null)).rejects.toBe(refreshError);
                expect(ctx.session.isExpired).toBe(true);
                expect(ctx.session).toHaveProperty('_rejectedSession.value', originalSession);

                ctx.patchSpecification('onRefresh', () => () => (reuseSessionObject ? originalSession : { id: 'replacement', token: 'token' }));
                await ctx.startSession();
                expect(ctx.session).toHaveProperty('_rejectedSession', undefined);
                expect(ctx.session.isExpired).toBe(false);
            });
        }

        test<RecoveryTestContext>('should reject with the original error when the retry is also unauthorized', async ctx => {
            const unauthorized = asSessionExpiredError(new Error('401'));

            await ctx.startSession();
            ctx.respondWith(unauthorized, unauthorized, unauthorized);

            await expect(ctx.session.http(null)).rejects.toBe(unauthorized);
            expect(ctx.httpCalls).toBe(2);
            expect(ctx.refreshes).toBe(2);
        });

        test<RecoveryTestContext>('should refresh only once for concurrent unauthorized requests', async ctx => {
            await ctx.startSession();
            ctx.respondWith(ERR_SESSION_EXPIRED, ERR_SESSION_EXPIRED);

            await expect(Promise.all([ctx.session.http(null), ctx.session.http(null)])).resolves.toEqual(['data', 'data']);
            expect(ctx.httpCalls).toBe(4);
            expect(ctx.refreshes).toBe(2);
        });

        test<RecoveryTestContext>('should recover when the session has no deadline', async ctx => {
            ctx.patchSpecification('deadline', () => () => []);

            await ctx.startSession();
            ctx.respondWith(ERR_SESSION_EXPIRED);

            await expect(ctx.session.http(null)).resolves.toBe('data');
            await expect(ctx.session.http(null)).resolves.toBe('data');
            expect(ctx.refreshes).toBe(2);
        });

        for (const method of ['GET', 'POST'] as const) {
            for (const withDeadline of [true, false]) {
                for (const siblingResponse of ['success', 'unauthorized'] as const) {
                    test<RecoveryTestContext>(`should not cancel an in-flight ${method} request when another request starts recovery (sibling response: ${siblingResponse}, deadline: ${withDeadline})`, async ctx => {
                        const specification = new AuthSessionSpecification();
                        ctx.patchSpecification('http', () => specification.http);
                        ctx.patchSpecification('onRefresh', () => () => ({ id: 'session-id', token: `token-${++ctx.refreshes}` }));
                        ctx.patchSpecification('deadline', () => () => (withDeadline ? Date.now() + 60_000 : []));
                        await ctx.startSession();

                        const requests: { path: string; token: string | null }[] = [];
                        const requestsTo = (path: string) => requests.filter(request => request.path === path);
                        let respondToSibling!: (response: Response) => void;

                        vi.stubGlobal(
                            'fetch',
                            vi.fn<typeof fetch>((input, init) => {
                                const path = new URL(String(input)).pathname;
                                const token = new Headers(init?.headers).get('Authorization');
                                requests.push({ path, token });

                                if (path === '/v1/sibling' && requestsTo(path).length === 1) {
                                    return new Promise<Response>((resolve, reject) => {
                                        respondToSibling = resolve;
                                        init!.signal!.addEventListener('abort', () => reject(init!.signal!.reason), { once: true });
                                    });
                                }
                                if (path === '/v1/trigger' && requestsTo(path).length === 1) {
                                    return Promise.resolve(Response.json({ status: 401 }, { status: 401 }));
                                }
                                return Promise.resolve(Response.json({ data: path, token }));
                            })
                        );

                        try {
                            const loadingContext = 'https://example.test';
                            const sibling = ctx.session.http(null, { loadingContext, method, path: '/sibling', body: { value: 1 } });
                            await waitForTicks(10);

                            await expect(ctx.session.http(null, { loadingContext, path: '/trigger' })).resolves.toEqual({
                                data: '/v1/trigger',
                                token: 'Bearer token-2',
                            });

                            if (siblingResponse === 'success') {
                                respondToSibling(Response.json({ data: 'first response' }));
                                await expect(sibling).resolves.toEqual({ data: 'first response' });
                                expect(requestsTo('/v1/sibling')).toEqual([{ path: '/v1/sibling', token: 'Bearer token-1' }]);
                            } else {
                                respondToSibling(Response.json({ status: 401 }, { status: 401 }));
                                await expect(sibling).resolves.toEqual({ data: '/v1/sibling', token: 'Bearer token-2' });
                                expect(requestsTo('/v1/sibling')).toEqual([
                                    { path: '/v1/sibling', token: 'Bearer token-1' },
                                    { path: '/v1/sibling', token: 'Bearer token-2' },
                                ]);
                            }

                            expect(ctx.refreshes).toBe(2);
                        } finally {
                            vi.unstubAllGlobals();
                        }
                    });
                }
            }
        }

        for (const withDeadline of [true, false]) {
            test<RecoveryTestContext>(`should report the session as expired when recovery fails (deadline: ${withDeadline})`, async ctx => {
                ctx.patchSpecification('deadline', () => () => (withDeadline ? Date.now() + 60_000 : []));
                await ctx.startSession();
                expect(ctx.session.isExpired).not.toBe(true);

                const refreshError = new Error('session refresh failed');
                ctx.patchSpecification('onRefresh', () => () => {
                    throw refreshError;
                });
                ctx.respondWith(ERR_SESSION_EXPIRED);

                await expect(ctx.session.http(null)).rejects.toBe(refreshError);
                expect(ctx.session.isExpired).toBe(true);
            });
        }

        test<RecoveryTestContext>('should not keep replacing a session that was created to recover from an expired-token response', async ctx => {
            const unauthorized = asSessionExpiredError(new Error('401'));

            await ctx.startSession();
            ctx.respondWith(...Array(10).fill(unauthorized));

            // Components request again after a session change, e.g. when the setup endpoints are refreshed
            for (let i = 0; i < 3; i++) {
                await expect(ctx.session.http(null)).rejects.toBe(unauthorized);
                await waitForTicks(5);
            }

            expect(ctx.refreshes).toBe(2);
            expect(ctx.httpCalls).toBe(4);
        });

        test<RecoveryTestContext>('should not reset the reauth throttle after a successful request or regular refresh', async ctx => {
            const unauthorized = asSessionExpiredError(new Error('401'));

            await ctx.startSession();
            ctx.respondWith(unauthorized, unauthorized);
            await expect(ctx.session.http(null)).rejects.toBe(unauthorized);

            await expect(ctx.session.http(null)).resolves.toBe('data');
            await ctx.startSession();
            ctx.respondWith(unauthorized);

            await expect(ctx.session.http(null)).rejects.toBe(unauthorized);
            expect(ctx.refreshes).toBe(3);
        });

        test<RecoveryTestContext>('should reject with the refresh error instead of retrying with the expired session when the refresh fails', async ctx => {
            const unauthorized = asSessionExpiredError(new Error('401'));
            const refreshError = new Error('session refresh failed');

            await ctx.startSession();
            ctx.patchSpecification('onRefresh', () => () => {
                ++ctx.refreshes;
                throw refreshError;
            });
            ctx.respondWith(unauthorized, unauthorized);

            await expect(ctx.session.http(null)).rejects.toBe(refreshError);
            expect(ctx.refreshes).toBe(2);
            expect(ctx.httpCalls).toBe(1);
        });

        test<RecoveryTestContext>('should reject concurrent requests with the refresh error when the shared refresh fails', async ctx => {
            const unauthorized = asSessionExpiredError(new Error('401'));
            const refreshError = new Error('session refresh failed');

            await ctx.startSession();
            ctx.patchSpecification('onRefresh', () => () => {
                ++ctx.refreshes;
                throw refreshError;
            });
            ctx.respondWith(unauthorized, unauthorized, unauthorized, unauthorized);

            const results = await Promise.allSettled([ctx.session.http(null), ctx.session.http(null)]);

            expect(results).toEqual([
                { status: 'rejected', reason: refreshError },
                { status: 'rejected', reason: refreshError },
            ]);
            expect(ctx.refreshes).toBe(2);
            expect(ctx.httpCalls).toBe(2);
        });

        for (const throttleMs of [undefined, 1000, -1, NaN, Infinity]) {
            test<RecoveryTestContext>(`should allow recovery at the throttle boundary (configured value: ${throttleMs})`, async ctx => {
                ctx.patchSpecification('reauthThrottleMs', () => throttleMs);
                const expectedThrottleMs = throttleMs === 1000 ? 1000 : 30_000;
                const unauthorized = asSessionExpiredError(new Error('401'));
                ctx.patchSpecification('deadline', () => () => []);

                await ctx.startSession();
                ctx.respondWith(unauthorized, unauthorized);
                await expect(ctx.session.http(null)).rejects.toBe(unauthorized);

                vi.advanceTimersByTime(expectedThrottleMs - 1);
                ctx.respondWith(unauthorized);
                await expect(ctx.session.http(null)).rejects.toBe(unauthorized);
                expect(ctx.refreshes).toBe(2);

                vi.advanceTimersByTime(1);
                ctx.respondWith(unauthorized);
                await expect(ctx.session.http(null)).resolves.toBe('data');
                expect(ctx.refreshes).toBe(3);
            });
        }

        for (const clockOffsetMs of [-5 * 60_000, 5 * 60_000]) {
            test<RecoveryTestContext>(`should preserve the reauth throttle when the wall clock shifts by ${clockOffsetMs} ms`, async ctx => {
                const unauthorized = asSessionExpiredError(new Error('401'));
                ctx.patchSpecification('deadline', () => () => []);

                await ctx.startSession();
                const startedAt = Date.now();
                ctx.respondWith(unauthorized, unauthorized);
                await expect(ctx.session.http(null)).rejects.toBe(unauthorized);
                expect(ctx.refreshes).toBe(2);

                vi.advanceTimersByTime(29_999);
                vi.setSystemTime(startedAt + 29_999 + clockOffsetMs);
                ctx.respondWith(unauthorized);
                await expect(ctx.session.http(null)).rejects.toBe(unauthorized);
                expect(ctx.refreshes).toBe(2);

                vi.advanceTimersByTime(1);
                ctx.respondWith(unauthorized);
                await expect(ctx.session.http(null)).resolves.toBe('data');
                expect(ctx.refreshes).toBe(3);
                expect(ctx.httpCalls).toBe(5);
            });
        }

        test<RecoveryTestContext>('should allow disabling the reauth throttle while still retrying only once per call', async ctx => {
            ctx.patchSpecification('reauthThrottleMs', () => 0);
            const unauthorized = asSessionExpiredError(new Error('401'));
            await ctx.startSession();
            ctx.respondWith(...Array(4).fill(unauthorized));

            await expect(ctx.session.http(null)).rejects.toBe(unauthorized);
            await expect(ctx.session.http(null)).rejects.toBe(unauthorized);
            expect(ctx.refreshes).toBe(3);
            expect(ctx.httpCalls).toBe(4);
        });

        test<RecoveryTestContext>('should share recovery with autofresh enabled', async ctx => {
            ctx.patchSpecification('autoRefresh', () => true);
            await ctx.startSession();
            ctx.respondWith(ERR_SESSION_EXPIRED, ERR_SESSION_EXPIRED);

            await expect(Promise.all([ctx.session.http(null), ctx.session.http(null)])).resolves.toEqual(['data', 'data']);
            await waitForTicks(5);
            expect(ctx.refreshes).toBe(2);
        });

        test<RecoveryTestContext>('should allow deadline-driven autofresh during the reauth throttle without resetting it', async ctx => {
            let deadline = new AbortController();
            ctx.patchSpecification('autoRefresh', () => true);
            ctx.patchSpecification('deadline', () => () => (deadline = new AbortController()).signal);
            await ctx.startSession();
            ctx.respondWith(ERR_SESSION_EXPIRED);
            await expect(ctx.session.http(null)).resolves.toBe('data');
            expect(ctx.refreshes).toBe(2);

            deadline.abort();
            await waitForTicks(20);
            expect(ctx.refreshes).toBe(3);

            ctx.respondWith(ERR_SESSION_EXPIRED);
            await expect(ctx.session.http(null)).rejects.toBe(ERR_SESSION_EXPIRED);
            expect(ctx.refreshes).toBe(3);
        });
    });
});

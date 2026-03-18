// @vitest-environment jsdom
import { beforeEach, describe, expect, test } from 'vitest';
import { SessionContext } from './SessionContext';
import { setupTimers } from '../../time/__testing__/fixtures';
import { EVT_SESSION_READY, EVT_SESSION_REFRESHED, EVT_SESSION_REFRESHING_END, EVT_SESSION_REFRESHING_START } from './constants';
import { augmentSpecificationContext, SpecificationContext } from './__testing__/fixtures';
import { waitForTicks } from './__testing__/utils';
import { noop } from '../../../utils';
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
});

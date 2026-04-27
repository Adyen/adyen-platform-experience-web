/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest';
import sessionReady from './sessionReady';
import { createMockServerContext, createMockSessionContext, MockSessionContext } from '../__testing__/MockSessionTestUtils';

describe('sessionReady', () => {
    createMockServerContext().initializeServer();

    beforeEach<MockSessionContext>(async ctx => void (await createMockSessionContext(ctx)));

    it<MockSessionContext>('should start one-off subscription to auth session', async ({ session, subscribe }) => {
        const readyPromise = sessionReady(session);

        // session.subscribe called once (immediately)
        expect(subscribe).toHaveBeenCalledOnce();

        await readyPromise;

        // session.subscribe not called again (called only once)
        expect(subscribe).toHaveBeenCalledTimes(1);
    });

    it<MockSessionContext>('should unsubscribe from auth session after ready promise settles', async ({ session, unsubscribes }) => {
        const readyPromise = sessionReady(session);
        const unsubscribe = unsubscribes[0]!;

        // unsubscribe not called yet until session ready promise is settled
        expect(unsubscribe).not.toHaveBeenCalled();

        await readyPromise;

        // unsubscribe called only once after session ready promise is settled
        expect(unsubscribe).toHaveBeenCalledOnce();
    });
});

/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest';
import { SetupContext } from './SetupContext';
import type { SetupResponse } from '../ConfigContext.types';

const setupResponse: SetupResponse = {
    endpoints: {
        sendTrackEvent: { method: 'POST', url: 'https://analytics.test/track' },
        sendEngageEvent: { method: 'POST', url: 'https://analytics.test/engage' },
    },
} as unknown as SetupResponse;

const createSetupContext = () => {
    // The session context is only used for its `http` call, which stubs the setup
    // endpoint response and every subsequent track/engage call.
    const http = vi.fn().mockResolvedValueOnce(setupResponse).mockResolvedValue({});
    const setupContext = new SetupContext({ http } as never);

    return { http, setupContext };
};

describe('SetupContext.sendAnalyticsEvent', () => {
    it('queues core events until the setup endpoint resolves', () => {
        const { http, setupContext } = createSetupContext();
        setupContext.analyticsEnabled = true;

        const payload = new URLSearchParams({ data: 'initiated-core-event' });
        setupContext.sendAnalyticsEvent(payload);

        expect(setupContext.analyticsPayload).toEqual([payload]);
        // Nothing is sent yet: no session call has happened at all.
        expect(http).not.toHaveBeenCalled();
    });

    it('flushes queued events through sendTrackEvent once setup resolves', async () => {
        const { http, setupContext } = createSetupContext();
        setupContext.analyticsEnabled = true;

        const payload = new URLSearchParams({ data: 'initiated-core-event' });
        setupContext.sendAnalyticsEvent(payload);

        await setupContext.refresh(new AbortController().signal);

        // setup endpoint + engage profile + track event
        await vi.waitFor(() => expect(http).toHaveBeenCalledTimes(3));
        expect(setupContext.analyticsPayload).toBeUndefined();
        expect(http.mock.calls[2]?.[1]).toMatchObject({ body: payload, method: 'POST' });
    });

    it('sends events immediately once the setup endpoints are live', async () => {
        const { http, setupContext } = createSetupContext();
        setupContext.analyticsEnabled = true;

        await setupContext.refresh(new AbortController().signal);
        await vi.waitFor(() => expect(http).toHaveBeenCalledTimes(2)); // setup + engage

        const payload = new URLSearchParams({ data: 'updated-theme-event' });
        setupContext.sendAnalyticsEvent(payload);

        await vi.waitFor(() => expect(http).toHaveBeenCalledTimes(3));
        expect(setupContext.analyticsPayload).toBeUndefined();
        expect(http.mock.calls[2]?.[1]).toMatchObject({ body: payload });
    });

    it('re-queues events that fail to send so the next refresh retries them', async () => {
        const http = vi.fn().mockResolvedValueOnce(setupResponse).mockResolvedValueOnce({}).mockRejectedValue(new Error('network down'));
        const setupContext = new SetupContext({ http } as never);
        setupContext.analyticsEnabled = true;

        const payload = new URLSearchParams({ data: 'initiated-core-event' });
        setupContext.sendAnalyticsEvent(payload);

        await setupContext.refresh(new AbortController().signal);

        await vi.waitFor(() => expect(http).toHaveBeenCalledTimes(3));
        expect(setupContext.analyticsPayload).toEqual([payload]);

        // A later refresh retries the failed payload.
        http.mockResolvedValueOnce(setupResponse).mockResolvedValue({});
        await setupContext.refresh(new AbortController().signal);

        await vi.waitFor(() => expect(setupContext.analyticsPayload).toBeUndefined());
    });

    it('ignores events when analytics is disabled', () => {
        const { http, setupContext } = createSetupContext();
        setupContext.analyticsEnabled = false;

        setupContext.sendAnalyticsEvent(new URLSearchParams({ data: 'initiated-core-event' }));

        expect(setupContext.analyticsPayload).toBeUndefined();
        expect(http).not.toHaveBeenCalled();
    });
});

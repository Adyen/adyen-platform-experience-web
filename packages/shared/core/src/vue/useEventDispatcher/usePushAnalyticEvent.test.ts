import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useConfigContext } from '../ConfigContext/useConfigContext';
import { usePushAnalyticEvent } from './usePushAnalyticEvent';

vi.mock('../ConfigContext/useConfigContext', () => ({
    useConfigContext: vi.fn(),
}));

describe('usePushAnalyticEvent', () => {
    const sendTrackEvent = vi.fn().mockResolvedValue(undefined);

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useConfigContext).mockReturnValue({
            endpoints: { sendTrackEvent },
        } as unknown as ReturnType<typeof useConfigContext>);
    });

    test('encodes events and scopes them to their component', () => {
        const pushEvent = usePushAnalyticEvent();
        const event = {
            event: 'Viewed list',
            properties: {
                componentName: 'transactions',
                account: 'BA1',
            },
        };

        pushEvent(event);

        expect(sendTrackEvent).toHaveBeenCalledOnce();
        const [{ body, contentType, keepalive }, options] = sendTrackEvent.mock.calls[0]!;
        const encoded = new URLSearchParams(body).get('data')!;

        expect(JSON.parse(atob(encoded))).toEqual(event);
        expect({ contentType, keepalive }).toEqual({
            contentType: 'application/x-www-form-urlencoded',
            keepalive: true,
        });
        expect(options).toEqual({ query: { component: 'transactions' } });
    });

    test('skips unavailable endpoints and unencodable events', () => {
        vi.mocked(useConfigContext).mockReturnValue({
            endpoints: {},
        } as unknown as ReturnType<typeof useConfigContext>);
        const withoutEndpoint = usePushAnalyticEvent();
        withoutEndpoint({ event: 'Ignored', properties: {} });

        vi.mocked(useConfigContext).mockReturnValue({
            endpoints: { sendTrackEvent },
        } as unknown as ReturnType<typeof useConfigContext>);
        const cyclic: Record<string, unknown> = {};
        cyclic.self = cyclic;
        usePushAnalyticEvent()({ event: 'Ignored', properties: cyclic as never });

        expect(sendTrackEvent).not.toHaveBeenCalled();
    });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { setupAnalytics } from './setupAnalytics';
import type { EventQueueItem } from './Analytics/analytics/user-events';

describe('setupAnalytics', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should safely initialize analytics when navigator is unavailable', () => {
        vi.stubGlobal('navigator', undefined);

        const events: EventQueueItem[] = [];
        const { subscribe, userEvents } = setupAnalytics({ analyticsEnabled: true });

        subscribe(event => {
            events.push(event);
        });

        userEvents.addEvent?.('Clicked button', {
            category: 'Analytics',
            subCategory: 'Setup',
        });

        expect(events[0]?.properties?.userAgent).toBe('');
    });
});

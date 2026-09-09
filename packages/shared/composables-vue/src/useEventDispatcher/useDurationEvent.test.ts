/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, h, type App } from 'vue';
import { useEventDispatcherContext } from '@integration-components/core/vue';
import { useDurationEvent } from './useDurationEvent';

vi.mock('@integration-components/core/vue', () => ({
    useEventDispatcherContext: vi.fn(),
}));

describe('useDurationEvent', () => {
    const addEvent = vi.fn();
    let app: App | undefined;
    let target: HTMLDivElement | undefined;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useEventDispatcherContext).mockReturnValue({ addEvent });
    });

    afterEach(() => {
        app?.unmount();
        target?.remove();
        vi.restoreAllMocks();
    });

    test('reports the floored mounted duration when the component unmounts', () => {
        let now = 100.9;
        vi.spyOn(performance, 'now').mockImplementation(() => now);

        app = createApp({
            setup() {
                useDurationEvent({ category: 'Transactions', subCategory: 'Overview', page: 'List' });
                return () => h('div');
            },
        });
        target = document.createElement('div');
        app.mount(target);

        expect(addEvent).not.toHaveBeenCalled();

        now = 142.7;
        app.unmount();
        app = undefined;

        expect(addEvent).toHaveBeenCalledOnce();
        expect(addEvent).toHaveBeenCalledWith('Duration', {
            category: 'Transactions',
            subCategory: 'Overview',
            page: 'List',
            duration: 41,
        });
    });
});

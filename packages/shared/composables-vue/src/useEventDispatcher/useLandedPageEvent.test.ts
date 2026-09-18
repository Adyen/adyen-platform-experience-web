/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, h, nextTick, ref, type App } from 'vue';
import { useEventDispatcherContext } from '@integration-components/core/vue';
import { useLandedPageEvent } from './useLandedPageEvent';

vi.mock('@integration-components/core/vue', () => ({
    useEventDispatcherContext: vi.fn(),
}));

describe('useLandedPageEvent', () => {
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
    });

    test('emits once with the latest properties when tracking becomes enabled', async () => {
        const enabled = ref(false);
        const properties = ref({ category: 'Transactions', subCategory: 'Overview', page: 'Initial' });

        app = createApp({
            setup() {
                useLandedPageEvent(properties, enabled);
                return () => h('div');
            },
        });
        target = document.createElement('div');
        app.mount(target);

        expect(addEvent).not.toHaveBeenCalled();

        properties.value = { ...properties.value, page: 'Updated' };
        enabled.value = true;
        await nextTick();

        expect(addEvent).toHaveBeenCalledOnce();
        expect(addEvent).toHaveBeenCalledWith('Landed on page', {
            category: 'Transactions',
            subCategory: 'Overview',
            page: 'Updated',
        });

        enabled.value = false;
        await nextTick();
        enabled.value = true;
        properties.value = { ...properties.value, page: 'Ignored' };
        await nextTick();

        expect(addEvent).toHaveBeenCalledOnce();
    });
});

/**
 * @vitest-environment jsdom
 */
/* eslint-disable vue/one-component-per-file */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, defineComponent, h, nextTick, ref, type App } from 'vue';
import { setupAnalytics } from '../../../setupAnalytics';
import { usePushAnalyticEvent } from '../../useEventDispatcher/usePushAnalyticEvent';
import EventDispatcherProvider from './EventDispatcherProvider.vue';
import { useEventDispatcherContext } from './useEventDispatcherContext';

vi.mock('../../../setupAnalytics', () => ({
    setupAnalytics: vi.fn(),
}));

vi.mock('../../useEventDispatcher/usePushAnalyticEvent', () => ({
    usePushAnalyticEvent: vi.fn(),
}));

describe('EventDispatcherProvider', () => {
    const pushAnalyticEvent = vi.fn();
    let app: App | undefined;
    let target: HTMLDivElement | undefined;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(usePushAnalyticEvent).mockReturnValue(pushAnalyticEvent);
    });

    afterEach(() => {
        app?.unmount();
        target?.remove();
    });

    test('forwards queued analytics events and unsubscribes on unmount', () => {
        const unsubscribe = vi.fn();
        const subscribe = vi.fn().mockReturnValue(unsubscribe);
        const addEvent = vi.fn();
        vi.mocked(setupAnalytics).mockReturnValue({
            userEvents: { addEvent },
            subscribe,
        });
        let userEvents!: ReturnType<typeof useEventDispatcherContext>;
        const child = defineComponent({
            setup: function EventDispatcherConsumer() {
                userEvents = useEventDispatcherContext();
                return () => h('div');
            },
        });

        app = createApp({
            setup: () => () =>
                h(
                    EventDispatcherProvider,
                    {
                        analyticsEnabled: true,
                        componentName: 'transactions',
                    },
                    { default: () => h(child) }
                ),
        });
        target = document.createElement('div');
        app.mount(target);

        expect(setupAnalytics).toHaveBeenCalledWith({
            analyticsEnabled: true,
            componentName: 'transactions',
        });

        userEvents.addEvent?.('Selected account', { account: 'BA1', category: 'Transactions', subCategory: 'Overview' });
        expect(addEvent).toHaveBeenCalledWith('Selected account', {
            account: 'BA1',
            category: 'Transactions',
            subCategory: 'Overview',
        });

        const pushEvent = subscribe.mock.calls[0]?.[0];
        pushEvent({ name: 'Viewed list' });
        pushEvent({ name: 'Filtered list', properties: { account: 'BA1' } });

        expect(pushAnalyticEvent).toHaveBeenNthCalledWith(1, {
            event: 'Viewed list',
            properties: {},
        });
        expect(pushAnalyticEvent).toHaveBeenNthCalledWith(2, {
            event: 'Filtered list',
            properties: { account: 'BA1' },
        });

        app.unmount();
        app = undefined;
        expect(unsubscribe).toHaveBeenCalledOnce();
    });

    test('replaces the analytics subscription when provider options change', async () => {
        const firstUnsubscribe = vi.fn();
        const secondUnsubscribe = vi.fn();
        const firstSubscribe = vi.fn().mockReturnValue(firstUnsubscribe);
        const secondSubscribe = vi.fn().mockReturnValue(secondUnsubscribe);
        vi.mocked(setupAnalytics)
            .mockReturnValueOnce({ userEvents: {}, subscribe: firstSubscribe })
            .mockReturnValueOnce({ userEvents: {}, subscribe: secondSubscribe });
        const analyticsEnabled = ref(false);

        app = createApp({
            setup: () => () =>
                h(EventDispatcherProvider, {
                    analyticsEnabled: analyticsEnabled.value,
                    componentName: 'payouts',
                }),
        });
        target = document.createElement('div');
        app.mount(target);

        expect(firstSubscribe).toHaveBeenCalledOnce();

        analyticsEnabled.value = true;
        await nextTick();

        expect(firstUnsubscribe).toHaveBeenCalledOnce();
        expect(secondSubscribe).toHaveBeenCalledOnce();

        app.unmount();
        app = undefined;
        expect(secondUnsubscribe).toHaveBeenCalledOnce();
    });
});

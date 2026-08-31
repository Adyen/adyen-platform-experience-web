/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, vi } from 'vitest';
import { createApp, defineComponent, h, nextTick, onMounted, ref } from 'vue';
import { createDomainEventBridge } from './createDomainEventBridge';

type TestEvents = {
    selected: Readonly<{ id: string }>;
};

const bridge = createDomainEventBridge<TestEvents>('Test events');

const Child = defineComponent({
    props: { id: { required: true, type: String } },
    setup(props) {
        const events = bridge.useEvents();
        onMounted(() => events.selected({ id: props.id }));
        return () => h('span');
    },
});

const Root = defineComponent({
    emits: { selected: (_payload: TestEvents['selected']) => true },
    props: { id: { required: true, type: String } },
    setup(props, { emit }) {
        const hasSelectedListener = bridge.hasListener('selected');
        bridge.provideEvents({ selected: payload => emit('selected', payload) });
        return () => h('div', { 'data-listener': String(hasSelectedListener.value) }, [h(Child, { id: props.id })]);
    },
});

describe('createDomainEventBridge', () => {
    test('forwards a nested event exactly once and detects the root listener', async () => {
        const listener = vi.fn();
        const target = document.createElement('div');
        const app = createApp({ render: () => h(Root, { id: 'first', onSelected: listener }) });

        app.mount(target);
        await nextTick();

        expect(listener).toHaveBeenCalledOnce();
        expect(listener).toHaveBeenCalledWith({ id: 'first' });
        expect(target.querySelector('[data-listener]')?.getAttribute('data-listener')).toBe('true');
        app.unmount();
    });

    test('keeps event triggers scoped to each Vue application', async () => {
        const firstListener = vi.fn();
        const secondListener = vi.fn();
        const firstTarget = document.createElement('div');
        const secondTarget = document.createElement('div');
        const firstApp = createApp({ render: () => h(Root, { id: 'first', onSelected: firstListener }) });
        const secondApp = createApp({ render: () => h(Root, { id: 'second', onSelected: secondListener }) });

        firstApp.mount(firstTarget);
        secondApp.mount(secondTarget);
        await nextTick();

        expect(firstListener).toHaveBeenCalledOnce();
        expect(firstListener).toHaveBeenCalledWith({ id: 'first' });
        expect(secondListener).toHaveBeenCalledOnce();
        expect(secondListener).toHaveBeenCalledWith({ id: 'second' });
        firstApp.unmount();
        secondApp.unmount();
    });

    test('updates listener detection when a parent adds a listener', async () => {
        const listener = vi.fn();
        const listening = ref(false);
        const target = document.createElement('div');
        const app = createApp({
            render: () => h(Root, { id: 'dynamic', ...(listening.value ? { onSelected: listener } : {}) }),
        });

        app.mount(target);
        await nextTick();
        expect(target.querySelector('[data-listener]')?.getAttribute('data-listener')).toBe('false');

        listening.value = true;
        await nextTick();
        expect(target.querySelector('[data-listener]')?.getAttribute('data-listener')).toBe('true');
        app.unmount();
    });
});

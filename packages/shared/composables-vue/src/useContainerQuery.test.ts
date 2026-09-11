/**
 * @vitest-environment jsdom
 */
/* eslint-disable vue/one-component-per-file */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, defineComponent, h, nextTick, ref, type App } from 'vue';
import { COMPONENT_REF_KEY } from '@integration-components/core/vue/Context/constants';
import { useContainerQuery } from './useContainerQuery';

describe('useContainerQuery', () => {
    let app: App | undefined;
    let target: HTMLDivElement | undefined;
    let resizeCallbacks: ResizeObserverCallback[];
    const observe = vi.fn();
    const disconnect = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        resizeCallbacks = [];
        vi.stubGlobal(
            'ResizeObserver',
            vi.fn(function (callback: ResizeObserverCallback) {
                resizeCallbacks.push(callback);
                return { disconnect, observe, unobserve: vi.fn() };
            })
        );
        vi.stubGlobal(
            'requestAnimationFrame',
            vi.fn((callback: FrameRequestCallback) => {
                callback(0);
                return 1;
            })
        );
        vi.stubGlobal('cancelAnimationFrame', vi.fn());
    });

    afterEach(() => {
        app?.unmount();
        target?.remove();
        vi.unstubAllGlobals();
    });

    test('tracks responsive ranges from the provided component element', async () => {
        const element = document.createElement('section');
        let width = 500;
        Object.defineProperty(element, 'offsetWidth', { get: () => width });
        const componentRef = ref<HTMLElement | null>(element);
        let up!: ReturnType<typeof useContainerQuery>;
        let down!: ReturnType<typeof useContainerQuery>;
        let only!: ReturnType<typeof useContainerQuery>;

        const child = defineComponent({
            setup() {
                up = useContainerQuery(['up', 600]);
                down = useContainerQuery(['down', 599]);
                only = useContainerQuery(['only', 400, { min: 400, max: 700 }]);
                return () => h('div');
            },
        });

        app = createApp(child);
        app.provide(COMPONENT_REF_KEY, componentRef);
        target = document.createElement('div');
        app.mount(target);

        expect(observe).toHaveBeenCalledWith(element);
        expect(up.value).toBe(false);
        expect(down.value).toBe(true);
        expect(only.value).toBe(true);

        width = 750;
        resizeCallbacks.forEach(callback => callback([{ target: element } as unknown as ResizeObserverEntry], {} as ResizeObserver));

        expect(up.value).toBe(true);
        expect(down.value).toBe(false);
        expect(only.value).toBe(false);

        componentRef.value = null;
        await nextTick();
        expect(disconnect).toHaveBeenCalled();
    });

    test('ignores resize entries for another element', () => {
        const element = document.createElement('section');
        Object.defineProperty(element, 'offsetWidth', { get: () => 500 });
        let matches!: ReturnType<typeof useContainerQuery>;

        const child = defineComponent({
            setup() {
                matches = useContainerQuery(['up', 600]);
                return () => h('div');
            },
        });

        app = createApp(child);
        app.provide(COMPONENT_REF_KEY, ref(element));
        target = document.createElement('div');
        app.mount(target);

        resizeCallbacks[0]?.([{ target: document.createElement('div') } as unknown as ResizeObserverEntry], {} as ResizeObserver);
        expect(matches.value).toBe(false);
    });
});

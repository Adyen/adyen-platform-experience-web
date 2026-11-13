/**
 * @vitest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, defineComponent, h, nextTick, ref, type App, type Component } from 'vue';
import { COMPONENT_REF_KEY } from '@integration-components/core/vue/Context/constants';
import { useContainerQuery } from './useContainerQuery';

const COMPACT_QUERY = ['down', 479] as const;
// Widths seen in Storybook with a 523px viewport: 523px minus 32px padding is 491px.
// A classic 15px vertical scrollbar takes it down to 476px, which is below the 480px breakpoint.
const WIDTH_WITHOUT_SCROLLBAR = 491;
const WIDTH_WITH_SCROLLBAR = 476;

describe('useContainerQuery', () => {
    let app: App | undefined;
    let target: HTMLDivElement | undefined;
    let resizeCallbacks: ResizeObserverCallback[];
    const observe = vi.fn();
    const disconnect = vi.fn();

    const createContainer = (initialWidth: number) => {
        const element = document.createElement('section');
        let width = initialWidth;
        Object.defineProperty(element, 'offsetWidth', { get: () => width });
        const resizeTo = (nextWidth: number) => {
            width = nextWidth;
            resizeCallbacks.forEach(callback => callback([{ target: element } as unknown as ResizeObserverEntry], {} as ResizeObserver));
        };
        return { element, resizeTo };
    };

    const mountInContainer = (element: HTMLElement, component: Component) => {
        app = createApp(component);
        app.provide(COMPONENT_REF_KEY, ref(element));
        target = document.createElement('div');
        app.mount(target);
    };

    const mountCompactQuery = (element: HTMLElement) => {
        let isCompact!: ReturnType<typeof useContainerQuery>;
        mountInContainer(
            element,
            defineComponent({
                setup() {
                    isCompact = useContainerQuery(COMPACT_QUERY);
                    return () => h('div');
                },
            })
        );
        return isCompact;
    };

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

    test('does not flip back when the narrower layout removes the scrollbar that caused the switch', () => {
        const { element, resizeTo } = createContainer(WIDTH_WITHOUT_SCROLLBAR);
        const isCompact = mountCompactQuery(element);
        expect(isCompact.value).toBe(false);

        const states: boolean[] = [];
        for (let frame = 0; frame < 4; frame++) {
            resizeTo(isCompact.value ? WIDTH_WITHOUT_SCROLLBAR : WIDTH_WITH_SCROLLBAR);
            states.push(isCompact.value);
        }

        expect(states).toEqual([true, true, true, true]);
    });

    test('switches to the wider layout once the container grows beyond the scrollbar tolerance', () => {
        const { element, resizeTo } = createContainer(WIDTH_WITH_SCROLLBAR);
        const isCompact = mountCompactQuery(element);
        expect(isCompact.value).toBe(true);

        resizeTo(WIDTH_WITHOUT_SCROLLBAR);
        expect(isCompact.value).toBe(true);

        resizeTo(520);
        expect(isCompact.value).toBe(false);
    });

    test('matches "only" ranges against both the min and the max bound', () => {
        const { element, resizeTo } = createContainer(350);
        let only!: ReturnType<typeof useContainerQuery>;
        mountInContainer(
            element,
            defineComponent({
                setup() {
                    only = useContainerQuery(['only', 400, { min: 400, max: 700 }]);
                    return () => h('div');
                },
            })
        );
        expect(only.value).toBe(false);

        resizeTo(500);
        expect(only.value).toBe(true);
    });

    test('keeps the current layout in every query of the container while it is hidden', () => {
        const { element, resizeTo } = createContainer(600);
        let first!: ReturnType<typeof useContainerQuery>;
        let second!: ReturnType<typeof useContainerQuery>;
        mountInContainer(
            element,
            defineComponent({
                setup() {
                    first = useContainerQuery(COMPACT_QUERY);
                    second = useContainerQuery(COMPACT_QUERY);
                    return () => h('div');
                },
            })
        );
        expect([first.value, second.value]).toEqual([false, false]);

        resizeTo(0);
        expect([first.value, second.value]).toEqual([false, false]);

        resizeTo(600);
        expect([first.value, second.value]).toEqual([false, false]);
    });

    test('shares the resolved state with queries mounted later in the same container', async () => {
        const { element, resizeTo } = createContainer(WIDTH_WITHOUT_SCROLLBAR);
        const showLateChild = ref(false);
        let early!: ReturnType<typeof useContainerQuery>;
        let late: ReturnType<typeof useContainerQuery> | undefined;

        const lateChild = defineComponent({
            setup() {
                late = useContainerQuery(COMPACT_QUERY);
                return () => h('div');
            },
        });

        mountInContainer(
            element,
            defineComponent({
                setup() {
                    early = useContainerQuery(COMPACT_QUERY);
                    return () => (showLateChild.value ? h(lateChild) : h('div'));
                },
            })
        );

        resizeTo(WIDTH_WITH_SCROLLBAR);
        resizeTo(WIDTH_WITHOUT_SCROLLBAR);
        expect(early.value).toBe(true);

        showLateChild.value = true;
        await nextTick();
        expect(late?.value).toBe(true);
    });
});

/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, h, ref } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import CashOutHeader from './CashOutHeader.vue';

const { addEvent } = vi.hoisted(() => ({ addEvent: vi.fn() }));

const TITLE = 'cashOut.request.title';
const OPTIONS = [
    { label: 'Main', value: 'BA1' },
    { label: 'Secondary', value: 'BA2' },
];

const selector: { disabled?: boolean; options?: unknown; select?: (value: string) => void } = {};
// Each time the header renders, with the time of the last update it gets.
const headerRenders: { lastUpdated?: Date | number; reloadButton?: { event: () => void } }[] = [];

vi.mock('@adyen/bento-vue3', async () => {
    const { h } = await import('vue');
    return {
        // Declared props, so they arrive camelCased instead of as attributes
        BentoHeader: Object.assign(
            (props: { title: string; lastUpdated?: Date | number; reloadButton?: { event: () => void } }) => {
                headerRenders.push({ lastUpdated: props.lastUpdated, reloadButton: props.reloadButton });
                return h('h2', props.title);
            },
            { props: ['title', 'lastUpdated', 'reloadButton'] }
        ),
    };
});

vi.mock('@integration-components/core/vue', () => ({
    useEventDispatcherContext: () => ({ addEvent }),
    useCoreContext: vi.fn(),
}));

vi.mock('../BalanceAccountSelector/BalanceAccountSelector.vue', async () => {
    const { defineComponent, h } = await import('vue');
    return {
        default: defineComponent({
            props: { modelValue: { type: String, default: undefined }, options: { type: Array, required: true }, disabled: Boolean },
            emits: ['update:modelValue'],
            setup(props, { emit }) {
                selector.select = value => emit('update:modelValue', value);
                return () => {
                    selector.options = props.options;
                    selector.disabled = props.disabled;
                    return h('div', { 'data-testid': 'selector' }, props.modelValue);
                };
            },
        }),
    };
});

const renderHeader = ({
    hideTitle = false,
    disableBalanceAccountSelector = false,
    lastUpdated,
    onRefresh,
}: { hideTitle?: boolean; disableBalanceAccountSelector?: boolean; lastUpdated?: number; onRefresh?: () => void } = {}) => {
    const selected = ref<string | undefined>('BA1');
    const target = document.createElement('div');
    const app = createApp({
        setup: () => () =>
            h(CashOutHeader, {
                balanceAccountOptions: OPTIONS,
                hideTitle,
                disableBalanceAccountSelector,
                lastUpdated,
                onRefresh,
                titleKey: TITLE,
                selectedBalanceAccountId: selected.value,
                'onUpdate:selectedBalanceAccountId': (value: string | undefined) => (selected.value = value),
            }),
    });
    app.mount(target);
    return { selected, target, unmount: () => app.unmount() };
};

describe('CashOutHeader', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        selector.options = undefined;
        selector.disabled = undefined;
        vi.mocked(useCoreContext).mockReturnValue({ i18n: { get: (key: string) => key } } as unknown as ReturnType<typeof useCoreContext>);
    });

    test('should show the title and the balance account selector', () => {
        const { target, unmount } = renderHeader();

        expect(target.querySelector('h2')?.textContent).toBe(TITLE);
        expect(target.querySelector('[data-testid="selector"]')?.textContent).toBe('BA1');
        expect(selector.options).toEqual(OPTIONS);

        unmount();
    });

    test('should keep the balance account selector when the title is hidden', () => {
        const { target, unmount } = renderHeader({ hideTitle: true });

        expect(target.querySelector('h2')).toBeNull();
        expect(target.querySelector('[data-testid="selector"]')?.textContent).toBe('BA1');

        unmount();
    });

    test.each([
        ['with the title', false],
        ['without the title', true],
    ])('should select the balance account chosen in the selector %s', (_, hideTitle) => {
        const { selected, unmount } = renderHeader({ hideTitle });

        selector.select?.('BA2');

        expect(selected.value).toBe('BA2');

        unmount();
    });

    test.each([
        ['with the title', false],
        ['without the title', true],
    ])('should disable the balance account selector when asked %s', (_, hideTitle) => {
        const { unmount } = renderHeader({ hideTitle, disableBalanceAccountSelector: true });

        expect(selector.disabled).toBe(true);

        unmount();
    });

    test('should leave the balance account selector enabled otherwise', () => {
        const { unmount } = renderHeader();

        expect(selector.disabled).toBe(false);

        unmount();
    });

    // Bento's header tells how long ago the last update was only when it renders, so it gets the same time again, as a new Date,
    // to tell it again.
    describe('Time of the last update', () => {
        const LAST_UPDATED = Date.UTC(2026, 10, 19, 12, 0, 0);
        const lastShown = () => headerRenders.at(-1)?.lastUpdated;

        beforeEach(() => {
            vi.useFakeTimers();
            headerRenders.length = 0;
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        test('should tell it again every 30 seconds, so the header counts how long ago it was', async () => {
            const { unmount } = renderHeader({ lastUpdated: LAST_UPDATED, onRefresh: vi.fn() });
            const first = lastShown();
            expect(first).toEqual(new Date(LAST_UPDATED));

            await vi.advanceTimersByTimeAsync(30_000);

            expect(lastShown()).not.toBe(first);
            expect(lastShown()).toEqual(new Date(LAST_UPDATED));

            unmount();
        });

        // Browsers slow down the timers of a hidden page, so it would show an outdated time for a while when shown again.
        test('should tell it again as soon as the page is shown again', async () => {
            const { unmount } = renderHeader({ lastUpdated: LAST_UPDATED, onRefresh: vi.fn() });
            const first = lastShown();

            document.dispatchEvent(new Event('visibilitychange'));
            await vi.advanceTimersByTimeAsync(0);

            expect(lastShown()).not.toBe(first);

            unmount();
        });

        test('should not keep counting once no longer shown', () => {
            const { unmount } = renderHeader({ lastUpdated: LAST_UPDATED, onRefresh: vi.fn() });

            unmount();

            expect(vi.getTimerCount()).toBe(0);
        });

        // Without a refresh, the header shows no time.
        test('should not count without a refresh', () => {
            const { unmount } = renderHeader({ lastUpdated: LAST_UPDATED });

            expect(lastShown()).toBeUndefined();
            expect(vi.getTimerCount()).toBe(0);

            unmount();
        });
    });

    test('should tell the refresh was clicked, and refresh', () => {
        const onRefresh = vi.fn();
        const { unmount } = renderHeader({ lastUpdated: Date.now(), onRefresh });

        headerRenders.at(-1)?.reloadButton?.event();

        expect(onRefresh).toHaveBeenCalledTimes(1);
        expect(addEvent).toHaveBeenCalledWith('Clicked button', { category: 'CashOut request component', subCategory: 'Request', label: 'Refresh' });

        unmount();
    });
});

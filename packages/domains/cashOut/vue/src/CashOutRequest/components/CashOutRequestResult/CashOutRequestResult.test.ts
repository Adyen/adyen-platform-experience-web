/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import CashOutRequestResult from './CashOutRequestResult.vue';

vi.mock('@integration-components/composables-vue', async () => {
    const { defineComponent, h } = await import('vue');
    return {
        EmptyState: defineComponent({
            props: { title: { type: String, required: true }, type: { type: String, required: true } },
            setup:
                (props, { slots }) =>
                () =>
                    h('div', { 'data-type': props.type }, [h('h2', props.title), h('p', slots.default?.())]),
        }),
    };
});

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: vi.fn(),
}));

const renderResult = (props: { status: 'success' | 'error'; currency?: string }) => {
    const target = document.createElement('div');
    const app = createApp(CashOutRequestResult, props);
    app.mount(target);
    const emptyStateType = () => target.querySelector('[data-type]')?.getAttribute('data-type');
    return { emptyStateType, target, unmount: () => app.unmount() };
};

describe('CashOutRequestResult', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useCoreContext).mockReturnValue({
            i18n: {
                // The count, which picks the plural form, shows only when it's given.
                get: (key: string, options?: { values?: Record<string, unknown>; count?: number }) =>
                    [key, ...Object.values(options?.values ?? {}), ...(options?.count === undefined ? [] : [`count=${options.count}`])].join(' '),
            },
        } as unknown as ReturnType<typeof useCoreContext>);
    });

    test('should tell that the cashOut was sent', () => {
        const { emptyStateType, target, unmount } = renderResult({ status: 'success', currency: 'USD' });

        expect(emptyStateType()).toBe('success');
        expect(target.querySelector('[role="status"]')?.textContent).toBe(
            'cashOut.request.success.titlecashOut.request.success.description cashOut.common.arrivalTime.withinMinutes 5 count=5'
        );

        unmount();
    });

    test('should tell that the cashOut failed', () => {
        const { emptyStateType, target, unmount } = renderResult({ status: 'error' });

        expect(emptyStateType()).toBe('error');
        expect(target.querySelector('[role="alert"]')?.textContent).toBe('cashOut.request.errors.titlecashOut.request.errors.tryAgain');

        unmount();
    });

    // Per currency, from the arrival times of the CDN; the bundled ones give 30 minutes to a currency without its own.
    test.each([
        ['EUR', 5],
        ['SEK', 30],
        [undefined, 30],
    ])('should tell when money in %s usually arrives', (currency, minutes) => {
        const { target, unmount } = renderResult({ status: 'success', currency });

        expect(target.querySelector('p')?.textContent).toBe(
            `cashOut.request.success.description cashOut.common.arrivalTime.withinMinutes ${minutes} count=${minutes}`
        );

        unmount();
    });
});

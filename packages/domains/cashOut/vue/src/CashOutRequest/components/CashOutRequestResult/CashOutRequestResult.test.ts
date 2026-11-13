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

const renderResult = (props: { status: 'success' | 'error' }) => {
    const target = document.createElement('div');
    const app = createApp(CashOutRequestResult, props);
    app.mount(target);
    const emptyStateType = () => target.querySelector('[data-type]')?.getAttribute('data-type');
    return { emptyStateType, target, unmount: () => app.unmount() };
};

describe('CashOutRequestResult', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useCoreContext).mockReturnValue({ i18n: { get: (key: string) => key } } as unknown as ReturnType<typeof useCoreContext>);
    });

    test('should tell that the cashOut was sent', () => {
        const { emptyStateType, target, unmount } = renderResult({ status: 'success' });

        expect(emptyStateType()).toBe('success');
        expect(target.querySelector('[role="status"]')?.textContent).toBe('cashOut.request.success.titlecashOut.request.success.description');

        unmount();
    });

    test('should tell that the cashOut failed', () => {
        const { emptyStateType, target, unmount } = renderResult({ status: 'error' });

        expect(emptyStateType()).toBe('error');
        expect(target.querySelector('[role="alert"]')?.textContent).toBe('cashOut.common.errors.somethingWentWrongcashOut.request.errors.tryAgain');

        unmount();
    });
});

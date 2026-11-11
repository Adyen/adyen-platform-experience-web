/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import CashOutRequestResult from './CashOutRequestResult.vue';

vi.mock('@adyen/bento-vue3', async () => {
    const { h } = await import('vue');
    return {
        BentoTypography: (_: unknown, { slots }: { slots: { default?: () => unknown } }) => h('p', slots.default?.() as never),
    };
});

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: vi.fn(),
}));

vi.mock('@adyen/ui-assets-icons-40/vue/checkmark-circle', async () => {
    const { h } = await import('vue');
    return { default: () => h('svg', { 'data-testid': 'success-icon' }) };
});

vi.mock('@adyen/ui-assets-icons-40/vue/cross-circle', async () => {
    const { h } = await import('vue');
    return { default: () => h('svg', { 'data-testid': 'error-icon' }) };
});

const renderResult = (props: { status: 'success' | 'error' }) => {
    const target = document.createElement('div');
    const app = createApp(CashOutRequestResult, props);
    app.mount(target);
    return { target, unmount: () => app.unmount() };
};

describe('CashOutRequestResult', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useCoreContext).mockReturnValue({ i18n: { get: (key: string) => key } } as unknown as ReturnType<typeof useCoreContext>);
    });

    test('should tell that the cashOut was sent', () => {
        const { target, unmount } = renderResult({ status: 'success' });

        expect(target.querySelector('[data-testid="success-icon"]')).not.toBeNull();
        expect(target.querySelector('[role="status"]')?.textContent).toBe('cashOut.request.success.titlecashOut.request.success.description');

        unmount();
    });

    test('should tell that the cashOut failed', () => {
        const { target, unmount } = renderResult({ status: 'error' });

        expect(target.querySelector('[data-testid="error-icon"]')).not.toBeNull();
        expect(target.querySelector('[role="alert"]')?.textContent).toBe('cashOut.common.errors.somethingWentWrongcashOut.request.errors.tryAgain');

        unmount();
    });

    test('should not offer to close the component', () => {
        const { target, unmount } = renderResult({ status: 'success' });

        expect(target.querySelector('button')).toBeNull();

        unmount();
    });
});

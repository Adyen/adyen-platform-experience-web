/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, type PropType } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import CashOutRequestResult from './CashOutRequestResult.vue';

const CLOSE = 'cashOut.common.actions.close.labels.default';

vi.mock('@adyen/bento-vue3', async () => {
    const { h } = await import('vue');
    return {
        BentoTypography: (_: unknown, { slots }: { slots: { default?: () => unknown } }) => h('p', slots.default?.() as never),
    };
});

vi.mock('@integration-components/composables-vue', async () => {
    const { defineComponent, h } = await import('vue');
    return {
        ResponsiveButtonActions: defineComponent({
            props: { actions: { type: Array as PropType<{ title: string; event?: () => void }[]>, required: true } },
            setup: props => () =>
                h(
                    'div',
                    props.actions.map(action => h('button', { onClick: action.event }, action.title))
                ),
        }),
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

const renderResult = (props: { status: 'success' | 'error'; onDismiss?: () => void }) => {
    const target = document.createElement('div');
    const app = createApp(CashOutRequestResult, props);
    app.mount(target);
    const closeButton = () => [...target.querySelectorAll('button')].find(button => button.textContent === CLOSE);
    return { closeButton, target, unmount: () => app.unmount() };
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

    test('should offer to close only when the component can be closed', () => {
        const onDismiss = vi.fn();
        const view = renderResult({ status: 'success', onDismiss });

        view.closeButton()?.click();
        expect(onDismiss).toHaveBeenCalledTimes(1);
        view.unmount();

        const { closeButton, unmount } = renderResult({ status: 'error' });
        expect(closeButton()).toBeUndefined();
        unmount();
    });
});

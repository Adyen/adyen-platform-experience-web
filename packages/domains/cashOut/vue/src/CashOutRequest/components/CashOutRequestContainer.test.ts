/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { computed, createApp } from 'vue';
import { useShouldHideTitles } from '@integration-components/composables-vue';
import CashOutRequestContainer from './CashOutRequestContainer.vue';

const requestProps: { current?: Record<string, unknown> } = {};

vi.mock('@integration-components/composables-vue', () => ({
    useShouldHideTitles: vi.fn(),
}));

vi.mock('./CashOutRequest/CashOutRequest.vue', async () => {
    const { defineComponent, h } = await import('vue');

    return {
        default: defineComponent({
            props: {
                hideTitle: Boolean,
                onContactSupport: { type: Function, default: undefined },
            },
            setup(props) {
                return () => {
                    requestProps.current = { ...props };
                    return h('div', 'request');
                };
            },
        }),
    };
});

const renderContainer = (props: Record<string, unknown>) => {
    const target = document.createElement('div');
    const app = createApp(CashOutRequestContainer, props);
    app.mount(target);
    return { unmount: () => app.unmount() };
};

describe('CashOutRequestContainer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        requestProps.current = undefined;
        vi.mocked(useShouldHideTitles).mockReturnValue(computed(() => true));
    });

    test('should pass whether to hide the title', () => {
        const { unmount } = renderContainer({});

        expect(requestProps.current).toMatchObject({ hideTitle: true });

        unmount();
    });

    test('should not offer contact support, even when an integration passes onContactSupport', () => {
        const { unmount } = renderContainer({ onContactSupport: vi.fn() });

        expect(requestProps.current?.onContactSupport).toBeUndefined();

        unmount();
    });
});

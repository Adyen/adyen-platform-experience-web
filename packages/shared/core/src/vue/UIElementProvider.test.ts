/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test, vi } from 'vitest';
import { createApp, h, nextTick, ref, type App } from 'vue';
import UIElementProvider from './UIElementProvider.vue';
import { DOMAIN_TRANSLATION_BINDING_KEY } from './Context/constants';

const hasPermission = ref<boolean | undefined>(undefined);

vi.mock('./ConfigContext/useConfigController', () => ({
    useConfigController: () => ({ configContextValue: {}, hasPermission }),
}));

vi.mock('./Context/CoreProvider.vue', async () => {
    const { defineComponent } = await import('vue');
    return {
        default: defineComponent({
            inheritAttrs: false,
            setup:
                (_, { slots }) =>
                () =>
                    slots.default?.(),
        }),
    };
});

vi.mock('./Context/eventDispatcher/EventDispatcherProvider.vue', async () => {
    const { defineComponent } = await import('vue');
    return {
        default: defineComponent({
            inheritAttrs: false,
            setup:
                (_, { slots }) =>
                () =>
                    slots.default?.(),
        }),
    };
});

vi.mock('@adyen/bento-vue3', async () => {
    const { h } = await import('vue');
    return {
        BentoLoadingIndicator: () => h('span', { 'data-testid': 'bento-loading-indicator' }),
        useBentoTranslationOverrides: vi.fn(),
    };
});

describe('UIElementProvider', () => {
    let app: App | undefined;
    let target: HTMLDivElement | undefined;

    const mount = () => {
        target = document.createElement('div');
        app = createApp({
            setup: () => () =>
                h(
                    UIElementProvider,
                    {
                        core: { session: {}, options: {} } as any,
                        bentoOverrides: {},
                        componentName: 'transactions',
                        refreshComponent: vi.fn(),
                    },
                    { default: () => h('span', { 'data-testid': 'content' }, 'content') }
                ),
        });
        app.provide(DOMAIN_TRANSLATION_BINDING_KEY, { i18n: {}, translationDomain: 'transactions' } as any);
        app.mount(target);
        return target;
    };

    afterEach(() => {
        app?.unmount();
        target?.remove();
        app = undefined;
        target = undefined;
        hasPermission.value = undefined;
    });

    test('shows the loading indicator inside a busy component frame until permission is granted', async () => {
        const root = mount();
        const getFrame = () => root.querySelector('section.adyen-pe-component');

        expect(getFrame()?.getAttribute('aria-busy')).toBe('true');
        expect(getFrame()?.querySelector('.adyen-pe-component__container [data-testid="bento-loading-indicator"]')).not.toBeNull();

        hasPermission.value = true;
        await nextTick();

        expect(getFrame()?.hasAttribute('aria-busy')).toBe(false);
        expect(getFrame()?.querySelector('.adyen-pe-component__container [data-testid="content"]')).not.toBeNull();
    });
});

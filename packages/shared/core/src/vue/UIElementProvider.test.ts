/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test, vi } from 'vitest';
import { createApp, defineComponent, h, type App } from 'vue';
import { useCoreContext } from './Context';
import { useConfigContext } from './ConfigContext';
import { DOMAIN_TRANSLATION_BINDING_KEY } from './Context/constants';
import type { DomainTranslationBinding } from './Context/types';
import type { CoreInstance } from './types';
import styles from './UIElement.module.scss';
import UIElementProvider from './UIElementProvider.vue';

vi.mock('@adyen/bento-vue3', async () => {
    const { defineComponent, h } = await import('vue');
    return {
        useBentoTranslationOverrides: vi.fn(),
        BentoButton: defineComponent({
            name: 'BentoButton',
            setup:
                (_props, { slots }) =>
                () =>
                    h('button', slots.default?.()),
        }),
        BentoTypography: defineComponent({
            name: 'BentoTypography',
            setup:
                (_props, { slots }) =>
                () =>
                    h('div', slots.default?.()),
        }),
        BentoLoadingIndicator: defineComponent({
            name: 'BentoLoadingIndicator',
            setup: () => () => h('div', { 'data-testid': 'loading-indicator', 'aria-hidden': 'true' }),
        }),
    };
});

vi.mock('./Context', () => ({
    useCoreContext: vi.fn(),
}));

vi.mock('./ConfigContext', () => ({
    useConfigContext: vi.fn(),
}));

vi.mock('./Context/CoreProvider.vue', () => ({
    default: defineComponent({
        name: 'CoreProvider',
        setup:
            (_props, { slots }) =>
            () =>
                slots.default?.(),
    }),
}));
vi.mock('./ConfigContext/ConfigProvider.vue', () => ({
    default: defineComponent({
        name: 'ConfigProvider',
        setup:
            (_props, { slots }) =>
            () =>
                slots.default?.(),
    }),
}));
vi.mock('./Context/eventDispatcher/EventDispatcherProvider.vue', () => ({
    default: defineComponent({
        name: 'EventDispatcherProvider',
        setup:
            (_props, { slots }) =>
            () =>
                slots.default?.(),
    }),
}));

const CONTENT_TEST_ID = 'gated-content';

const i18n = { get: vi.fn((key: string) => key) };

const setContext = ({ componentUnavailable = false, permissionPending = false } = {}) => {
    vi.mocked(useConfigContext).mockReturnValue({ componentUnavailable, permissionPending } as unknown as ReturnType<typeof useConfigContext>);
    vi.mocked(useCoreContext).mockReturnValue({
        i18n,
        translationDomain: 'transactions',
        getImageAsset: vi.fn(() => 'error.svg'),
    } as unknown as ReturnType<typeof useCoreContext>);
};

const createCoreStub = () =>
    ({
        loadingContext: {},
        getCdnConfig: vi.fn(),
        getCdnDataset: vi.fn(),
        getImageAsset: vi.fn(() => 'error.svg'),
        session: {},
        analyticsEnabled: true,
        options: { appearance: undefined, onError: vi.fn(), environment: 'test' },
    }) as unknown as CoreInstance;

describe('UIElementProvider', () => {
    let mounted: Array<{ app: App; target: HTMLDivElement }> = [];

    afterEach(() => {
        mounted.forEach(({ app, target }) => {
            app.unmount();
            target.remove();
        });
        mounted = [];
    });

    const mountProvider = (slotProps: Record<string, unknown> = {}) => {
        const SlotComponent = defineComponent({
            name: 'SlotComponent',
            props: { onContactSupport: { type: Function, default: undefined } },
            setup: () => () => h('div', { 'data-testid': CONTENT_TEST_ID }, 'domain component'),
        });

        const target = document.createElement('div');
        const app = createApp({
            setup: () => () =>
                h(
                    UIElementProvider,
                    { core: createCoreStub(), bentoOverrides: {}, componentName: 'transactions', refreshComponent: vi.fn() },
                    { default: () => h(SlotComponent, slotProps) }
                ),
        });
        app.provide(DOMAIN_TRANSLATION_BINDING_KEY, { i18n, translationDomain: 'transactions' } as unknown as DomainTranslationBinding);
        app.mount(target);
        mounted.push({ app, target });
        return target;
    };

    test('renders the component when it is available', () => {
        setContext({});

        const target = mountProvider();

        expect(target.querySelector(`[data-testid="${CONTENT_TEST_ID}"]`)).toBeTruthy();
        expect(target.querySelector('[data-testid="error-message-display"]')).toBeNull();
    });

    test('renders the availability error inside the component container when the component is unavailable', () => {
        setContext({ componentUnavailable: true });

        const target = mountProvider();

        const errorDisplay = target.querySelector('[data-testid="error-message-display"]');
        expect(errorDisplay).toBeTruthy();
        expect(target.querySelector(`[data-testid="${CONTENT_TEST_ID}"]`)).toBeNull();
        expect(errorDisplay?.closest(`.${styles.container}`)).toBe(target.querySelector(`.${styles.container}`));
    });

    test('renders the loading state while the permission check is pending', () => {
        setContext({ permissionPending: true });

        const target = mountProvider();

        expect(target.querySelector('[data-testid="loading-indicator"]')).toBeTruthy();
        expect(target.querySelector(`[data-testid="${CONTENT_TEST_ID}"]`)).toBeNull();
        expect(target.querySelector('[data-testid="error-message-display"]')).toBeNull();
    });

    test('forwards onContactSupport from the component to the availability error', () => {
        setContext({ componentUnavailable: true });
        const onContactSupport = vi.fn();

        const target = mountProvider({ onContactSupport });
        const supportButton = target.querySelector<HTMLButtonElement>('button');

        expect(supportButton?.textContent).toBe('transactions.common.actions.contactSupport.labels.reachOut');

        supportButton?.click();
        expect(onContactSupport).toHaveBeenCalledOnce();
    });
});

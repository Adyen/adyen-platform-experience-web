/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test, vi } from 'vitest';
import { createApp, defineComponent, h, nextTick, reactive, ref, type App } from 'vue';
import { useCoreContext } from './Context';
import { useConfigContext } from './ConfigContext';
import { DOMAIN_TRANSLATION_BINDING_KEY } from './Context/constants';
import type { DomainTranslationBinding } from './Context/types';
import type { CoreInstance } from './types';
import { VERSION_NOTICE_STORAGE_KEY } from '../versionNotice/constants';
import { getVersionNoticeId } from '../versionNotice/dismissal';
import type { VersionNotice } from '../versionNotice/types';
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
        BentoAlert: defineComponent({
            name: 'BentoAlert',
            emits: ['close-alert'],
            setup:
                (_props, { emit, slots }) =>
                () =>
                    h('div', [slots.default?.(), h('button', { 'aria-label': 'Close', onClick: () => emit('close-alert') })]),
        }),
    };
});

const { bannerModuleLoads } = vi.hoisted(() => ({ bannerModuleLoads: { count: 0 } }));

vi.mock('./versionNotice/VersionNoticeBanner.vue', async importOriginal => {
    bannerModuleLoads.count++;
    return importOriginal();
});

vi.mock('./Context', () => ({
    useCoreContext: vi.fn(),
}));

vi.mock('./ConfigContext', () => ({
    useConfigContext: vi.fn(),
}));

const { coreProviderBindings } = vi.hoisted(() => ({ coreProviderBindings: [] as Record<string, unknown>[] }));

vi.mock('./Context/CoreProvider.vue', () => ({
    default: defineComponent({
        name: 'CoreProvider',
        inheritAttrs: false,
        props: { externalErrorHandler: { type: Function, default: undefined } },
        setup(props, { slots }) {
            coreProviderBindings.push(props);
            return () => slots.default?.();
        },
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

const createCoreStub = (versionNotice: VersionNotice | null = null) =>
    ({
        loadingContext: {},
        getCdnConfig: vi.fn(),
        getCdnDataset: vi.fn(),
        getImageAsset: vi.fn(() => 'error.svg'),
        getVersionNotice: vi.fn(async () => versionNotice),
        session: {},
        analyticsEnabled: true,
        options: { appearance: undefined, onError: vi.fn(), environment: 'test' },
    }) as unknown as CoreInstance;

const VERSION_NOTICE_SELECTOR = '[data-testid="version-notice"]';

describe('UIElementProvider', () => {
    let mounted: Array<{ app: App; target: HTMLDivElement }> = [];
    let core: CoreInstance;

    afterEach(() => {
        mounted.forEach(({ app, target }) => {
            app.unmount();
            target.remove();
        });
        mounted = [];
        coreProviderBindings.length = 0;
    });

    const mountProvider = (slotProps: Record<string, unknown> = reactive({}), versionNotice: VersionNotice | null = null) => {
        const SlotComponent = defineComponent({
            name: 'SlotComponent',
            props: { onContactSupport: { type: Function, default: undefined } },
            setup: () => () => h('div', { 'data-testid': CONTENT_TEST_ID }, 'domain component'),
        });

        core = createCoreStub(versionNotice);

        const target = document.createElement('div');
        // Mirrors UIElement: props are read in the outer render, so the slot only closes over a plain copy.
        const app = createApp({
            setup: () => () => {
                const componentProps = { ...slotProps };
                return h(
                    UIElementProvider,
                    { core, bentoOverrides: {}, componentName: 'transactions', refreshComponent: vi.fn() },
                    { default: () => h(SlotComponent, componentProps) }
                );
            },
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

        expect(supportButton?.textContent).toBe('transactions.common.contactSupport.label');

        supportButton?.click();
        expect(onContactSupport).toHaveBeenCalledOnce();
    });

    test('forwards onContactSupport to the availability error when the component receives it after mounting', async () => {
        setContext({ componentUnavailable: true });
        const onContactSupport = vi.fn();
        const slotProps = reactive<Record<string, unknown>>({});

        const target = mountProvider(slotProps);
        expect(target.querySelector('button')).toBeNull();

        slotProps.onContactSupport = onContactSupport;
        await nextTick();

        const supportButton = target.querySelector<HTMLButtonElement>('button');
        expect(supportButton?.textContent).toBe('transactions.common.contactSupport.label');

        supportButton?.click();
        expect(onContactSupport).toHaveBeenCalledOnce();
    });

    test('re-translates the availability error when the component is refreshed after a locale change', async () => {
        setContext({ componentUnavailable: true });
        let locale = 'en-US';
        i18n.get.mockImplementation((key: string) => `${locale}:${key}`);

        core = createCoreStub();
        const target = document.createElement('div');
        // Mirrors UIElement: a locale change syncs translations and then refreshes through the refresh count.
        const refreshCount = ref(0);
        const app = createApp({
            setup: () => () =>
                h(
                    UIElementProvider,
                    {
                        core,
                        bentoOverrides: {},
                        componentName: 'transactions',
                        refreshComponent: vi.fn(),
                        refreshKey: refreshCount.value,
                    },
                    { default: () => h('div', { key: refreshCount.value, 'data-testid': CONTENT_TEST_ID }) }
                ),
        });
        app.provide(DOMAIN_TRANSLATION_BINDING_KEY, { i18n, translationDomain: 'transactions' } as unknown as DomainTranslationBinding);
        app.mount(target);
        mounted.push({ app, target });

        expect(target.textContent).toContain('en-US:transactions.overview.errors.unavailable');

        locale = 'de-DE';
        refreshCount.value++;
        await nextTick();

        expect(target.textContent).toContain('de-DE:transactions.overview.errors.unavailable');
        expect(target.textContent).not.toContain('en-US:');

        i18n.get.mockImplementation((key: string) => key);
    });

    test('wires the Core error handler into the provider', () => {
        setContext({});
        mountProvider();
        expect(coreProviderBindings[0]?.externalErrorHandler).toBe(core.options.onError);
    });

    describe('version notice', () => {
        // The banner module is cached once loaded, so the test that asserts it is never loaded must run first.
        const settle = async () => {
            await core.getVersionNotice();
            await new Promise(resolve => setTimeout(resolve));
            await nextTick();
        };

        afterEach(() => {
            window.localStorage.clear();
            vi.restoreAllMocks();
        });

        test('does not load the banner when there is nothing to report', async () => {
            setContext({});

            const target = mountProvider(reactive({}), null);
            await settle();

            expect(target.querySelector(VERSION_NOTICE_SELECTOR)).toBeNull();
            expect(bannerModuleLoads.count).toBe(0);
        });

        test('shows the notice above the component', async () => {
            setContext({});

            const target = mountProvider(reactive({}), { kind: 'deprecated', currentVersion: '1.10.0' });

            await vi.waitFor(() => expect(target.querySelector(VERSION_NOTICE_SELECTOR)).toBeTruthy());
            const content = target.querySelector(`[data-testid="${CONTENT_TEST_ID}"]`)!;
            expect(target.querySelector(VERSION_NOTICE_SELECTOR)!.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        });

        test('hides the notice in every component once it is dismissed in one of them', async () => {
            setContext({});
            const notice: VersionNotice = { kind: 'outdated', currentVersion: '2.0.0-beta.1', latestVersion: '2.0.0-beta.2' };

            const first = mountProvider(reactive({}), notice);
            const second = mountProvider(reactive({}), notice);
            await vi.waitFor(() => expect(second.querySelector(VERSION_NOTICE_SELECTOR)).toBeTruthy());

            first.querySelector<HTMLButtonElement>(`${VERSION_NOTICE_SELECTOR} button[aria-label="Close"]`)!.click();
            await nextTick();

            expect(first.querySelector(VERSION_NOTICE_SELECTOR)).toBeNull();
            expect(second.querySelector(VERSION_NOTICE_SELECTOR)).toBeNull();
            expect(window.localStorage.getItem(VERSION_NOTICE_STORAGE_KEY)).toBe(getVersionNoticeId(notice));
        });

        test('keeps a notice hidden when it was dismissed on an earlier visit', async () => {
            setContext({});
            const notice: VersionNotice = { kind: 'deprecated', currentVersion: '1.11.0' };
            window.localStorage.setItem(VERSION_NOTICE_STORAGE_KEY, getVersionNoticeId(notice));

            const target = mountProvider(reactive({}), notice);
            await settle();

            expect(target.querySelector(VERSION_NOTICE_SELECTOR)).toBeNull();
        });

        test('shows a notice again when a newer prerelease follows the dismissed one', async () => {
            setContext({});
            const dismissed: VersionNotice = { kind: 'outdated', currentVersion: '2.0.0-beta.1', latestVersion: '2.0.0-beta.3' };
            window.localStorage.setItem(VERSION_NOTICE_STORAGE_KEY, getVersionNoticeId(dismissed));

            const target = mountProvider(reactive({}), { ...dismissed, latestVersion: '2.0.0-beta.4' });

            await vi.waitFor(() => expect(target.querySelector(VERSION_NOTICE_SELECTOR)).toBeTruthy());
        });

        test('dismisses the notice for the session when storage is unavailable', async () => {
            setContext({});
            vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
                throw new DOMException('Blocked', 'SecurityError');
            });
            vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new DOMException('Blocked', 'SecurityError');
            });

            const target = mountProvider(reactive({}), { kind: 'deprecated', currentVersion: '1.12.0' });
            await vi.waitFor(() => expect(target.querySelector(VERSION_NOTICE_SELECTOR)).toBeTruthy());

            target.querySelector<HTMLButtonElement>(`${VERSION_NOTICE_SELECTOR} button[aria-label="Close"]`)!.click();
            await nextTick();

            expect(target.querySelector(VERSION_NOTICE_SELECTOR)).toBeNull();
        });
    });
});

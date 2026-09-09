/**
 * @vitest-environment jsdom
 */
/* eslint-disable vue/one-component-per-file */
import { afterEach, describe, expect, test, vi } from 'vitest';
import { createApp, defineComponent, h, type App } from 'vue';
import CoreProvider from './CoreProvider.vue';
import { useCoreContext } from './useCoreContext';

describe('CoreProvider', () => {
    let app: App | undefined;
    let target: HTMLDivElement | undefined;

    afterEach(() => {
        app?.unmount();
        target?.remove();
    });

    test('waits for localization and provides the element-scoped core context', async () => {
        let markReady!: () => void;
        const ready = new Promise<void>(resolve => {
            markReady = resolve;
        });
        const i18n = { ready };
        const refreshComponent = vi.fn();
        const getImageAsset = vi.fn();
        let injected!: ReturnType<typeof useCoreContext>;

        const child = defineComponent({
            setup: function CoreProviderConsumer() {
                injected = useCoreContext();
                return () => h('span', 'ready');
            },
        });

        app = createApp({
            setup: () => () =>
                h(
                    CoreProvider,
                    {
                        commonProps: { balanceAccountId: 'BA1' },
                        environment: 'test',
                        getImageAsset,
                        i18n,
                        loadingContext: 'session',
                        refreshComponent,
                    },
                    { default: () => h(child) }
                ),
        });
        const mountTarget = document.createElement('div');
        target = mountTarget;
        app.mount(mountTarget);

        expect(mountTarget.textContent).toBe('');

        markReady();
        await vi.waitFor(() => expect(mountTarget.textContent).toBe('ready'));

        expect(injected).toMatchObject({
            commonProps: { balanceAccountId: 'BA1' },
            environment: 'test',
            getImageAsset,
            i18n,
            loadingContext: 'session',
            refreshComponent,
        });
    });
});

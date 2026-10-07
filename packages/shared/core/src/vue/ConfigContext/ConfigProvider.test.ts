/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test, vi } from 'vitest';
import { createApp, defineComponent, h, type App } from 'vue';
import type { ExternalComponentType } from '@integration-components/types';
import type { AuthSession } from '../../session/AuthSession';
import ConfigProvider from './ConfigProvider.vue';
import { useConfigContext } from './useConfigContext';

const createSessionStub = (hasTransactionsEndpoint: boolean) => {
    const context = {
        endpoints: hasTransactionsEndpoint ? { getTransactions: vi.fn() } : {},
        extraConfig: {},
        hasError: false,
        isExpired: false,
        isFrozen: false,
        refreshing: false,
    };
    const listeners = new Set<(value: unknown) => void>();

    return {
        context,
        session: {
            context,
            http: vi.fn(),
            refresh: vi.fn(),
            subscribe: vi.fn((callback: (value: unknown) => void) => {
                listeners.add(callback);
                callback(context);
                return () => listeners.delete(callback);
            }),
        } as unknown as AuthSession,
    };
};

const SLOT_TEST_ID = 'slot-content';

describe('ConfigProvider', () => {
    let app: App | undefined;
    let target: HTMLDivElement | undefined;

    afterEach(() => {
        app?.unmount();
        target?.remove();
        app = undefined;
        target = undefined;
    });

    const mountConfigProvider = (session: AuthSession, type?: ExternalComponentType) => {
        let context!: ReturnType<typeof useConfigContext>;
        const slotProbe = defineComponent({
            name: 'SlotProbe',
            setup() {
                context = useConfigContext();
                return () => h('div', { 'data-testid': SLOT_TEST_ID });
            },
        });

        target = document.createElement('div');
        app = createApp({
            setup: () => () => h(ConfigProvider, { session, type }, { default: () => h(slotProbe) }),
        });
        app.mount(target);

        return {
            get context() {
                return context;
            },
        };
    };

    test('renders the slot while the permission check is pending, flagged as pending on the context', () => {
        const { session } = createSessionStub(true);

        const probe = mountConfigProvider(session, 'transactions');

        // The loading state belongs to the shared shell, rendered by the gate inside the slot.
        expect(target?.querySelector(`[data-testid="${SLOT_TEST_ID}"]`)).toBeTruthy();
        expect(target?.querySelector('.adyen-pe-spinner')).toBeNull();
        expect(probe.context.permissionPending).toBe(true);
    });

    test('clears the pending flag and reports the component as available', async () => {
        const { session } = createSessionStub(true);

        const probe = mountConfigProvider(session, 'transactions');

        await vi.waitFor(() => {
            expect(probe.context.permissionPending).toBe(false);
        });

        expect(target?.querySelector(`[data-testid="${SLOT_TEST_ID}"]`)).toBeTruthy();
        expect(probe.context.componentUnavailable).toBe(false);
    });

    test('clears the pending flag and reports the component as unavailable so the gate renders the error', async () => {
        const { session } = createSessionStub(false);

        const probe = mountConfigProvider(session, 'transactions');

        await vi.waitFor(() => {
            expect(probe.context.componentUnavailable).toBe(true);
        });

        expect(target?.querySelector(`[data-testid="${SLOT_TEST_ID}"]`)).toBeTruthy();
        expect(probe.context.permissionPending).toBe(false);
    });
});

/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test, vi } from 'vitest';
import { createApp, h, nextTick, shallowRef, type App } from 'vue';
import type { ExternalComponentType } from '@integration-components/types';
import type { AuthSession } from '../../session/AuthSession';
import { useConfigController } from './useConfigController';

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

describe('useConfigController', () => {
    let app: App | undefined;
    let target: HTMLDivElement | undefined;

    afterEach(() => {
        app?.unmount();
        target?.remove();
        app = undefined;
        target = undefined;
    });

    test('should reset permission for a new component type or session and allow an undefined component type', async () => {
        const { session: allowedSession } = createSessionStub(true);
        const { session: deniedSession } = createSessionStub(false);
        const session = shallowRef<AuthSession>(allowedSession);
        const type = shallowRef<ExternalComponentType | undefined>('transactions');

        let controller: ReturnType<typeof useConfigController> | undefined;

        const ConfigControllerHarness = () => {
            controller = useConfigController({
                getSession: () => session.value,
                getType: () => type.value,
            });
            return () => h('div');
        };

        target = document.createElement('div');
        app = createApp({ setup: ConfigControllerHarness });
        app.mount(target);

        await vi.waitFor(() => {
            expect(controller?.hasPermission.value).toBe(true);
        });

        type.value = 'payouts';
        await nextTick();
        expect(controller?.hasPermission.value).toBeUndefined();

        await vi.waitFor(() => {
            expect(controller?.hasPermission.value).toBe(false);
        });

        type.value = 'transactions';

        await vi.waitFor(() => {
            expect(controller?.hasPermission.value).toBe(true);
        });

        session.value = deniedSession;
        await nextTick();
        expect(controller?.hasPermission.value).toBeUndefined();

        await vi.waitFor(() => {
            expect(controller?.hasPermission.value).toBe(false);
        });

        type.value = undefined;

        await vi.waitFor(() => {
            expect(controller?.hasPermission.value).toBe(true);
        });
    });
});

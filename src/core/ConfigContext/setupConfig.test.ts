import { describe, expect, test, vi } from 'vitest';
import type { ExternalComponentType } from '../../components/types';
import { UNSUBSCRIBE_TOKEN } from '../../primitives/reactive/watchlist';
import type { AuthSession } from './session/AuthSession';
import { createConfigController } from './setupConfig';

const COMPONENT_TYPE: ExternalComponentType = 'transactions';

const createSessionStub = () => {
    const context = {
        endpoints: {},
        extraConfig: {},
        hasError: false,
        isExpired: undefined,
        isFrozen: false,
        refreshing: false,
    };
    const listeners = new Set<(value: unknown) => void>();
    const http = vi.fn();
    const refresh = vi.fn();
    const unsubscribeMocks: Array<ReturnType<typeof vi.fn>> = [];

    const session = {
        context,
        http,
        refresh,
        subscribe: vi.fn((callback: (value: unknown) => void) => {
            listeners.add(callback);
            callback(context);

            const unsubscribe = vi.fn(() => {
                listeners.delete(callback);
            });

            unsubscribeMocks.push(unsubscribe);
            return unsubscribe;
        }),
    } as unknown as AuthSession;

    return {
        context,
        emit(value: unknown = context) {
            [...listeners].forEach(listener => listener(value));
        },
        http,
        refresh,
        session,
        unsubscribeMocks,
    };
};

describe('createConfigController', () => {
    test('should expose the current session snapshot and load permission state', async () => {
        const { context, http, refresh, session } = createSessionStub();
        const checkPermission = vi.fn().mockResolvedValue(true);
        const onChange = vi.fn();
        const controller = createConfigController(session, COMPONENT_TYPE, checkPermission);

        const disconnect = controller.connect(onChange);
        await Promise.resolve();

        expect(checkPermission).toHaveBeenCalledWith(COMPONENT_TYPE, session);
        expect(controller.getSnapshot()).toEqual({
            contextValue: { ...context, http, refresh },
            hasPermission: true,
        });
        expect(onChange).toHaveBeenCalledTimes(2);

        disconnect();
    });

    test('should notify for session updates and resubscribe after unsubscribe tokens', () => {
        const { context, emit, session, unsubscribeMocks } = createSessionStub();
        const checkPermission = vi.fn(() => new Promise<boolean>(() => {}));
        const onChange = vi.fn();
        const controller = createConfigController(session, COMPONENT_TYPE, checkPermission);

        const disconnect = controller.connect(onChange);

        expect(session.subscribe).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledTimes(1);

        context.refreshing = true;
        emit(context);

        expect(onChange).toHaveBeenCalledTimes(2);
        expect(controller.getSnapshot().contextValue.refreshing).toBe(true);

        emit(UNSUBSCRIBE_TOKEN);

        expect(unsubscribeMocks[0]).toHaveBeenCalledTimes(1);
        expect(session.subscribe).toHaveBeenCalledTimes(2);
        expect(onChange).toHaveBeenCalledTimes(3);

        disconnect();

        expect(unsubscribeMocks[1]).toHaveBeenCalledTimes(1);
    });

    test('should ignore permission updates after disconnect', async () => {
        const { session } = createSessionStub();
        const onChange = vi.fn();
        let resolvePermission: ((value: boolean) => void) | undefined;
        const checkPermission = vi.fn(
            () =>
                new Promise<boolean>(resolve => {
                    resolvePermission = resolve;
                })
        );
        const controller = createConfigController(session, COMPONENT_TYPE, checkPermission);

        const disconnect = controller.connect(onChange);

        expect(onChange).toHaveBeenCalledTimes(1);

        disconnect();
        resolvePermission?.(true);
        await Promise.resolve();

        expect(controller.getSnapshot().hasPermission).toBeUndefined();
        expect(onChange).toHaveBeenCalledTimes(1);
    });
});

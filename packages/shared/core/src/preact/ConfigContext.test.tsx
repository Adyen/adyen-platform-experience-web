/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/preact';
import type { AuthSession } from '../session/AuthSession';
import { ConfigProvider } from './ConfigContext';

const CHILD_TEXT = 'Protected component';

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

describe('ConfigProvider', () => {
    test('should reset permission for a new component type or session and allow an undefined component type', async () => {
        const { session: allowedSession } = createSessionStub(true);
        const { session: deniedSession } = createSessionStub(false);
        const { rerender } = render(
            <ConfigProvider session={allowedSession} type="transactions">
                <div>{CHILD_TEXT}</div>
            </ConfigProvider>
        );

        await screen.findByText(CHILD_TEXT);

        rerender(
            <ConfigProvider session={allowedSession} type="payouts">
                <div>{CHILD_TEXT}</div>
            </ConfigProvider>
        );

        expect(screen.queryByText(CHILD_TEXT)).not.toBeInTheDocument();

        rerender(
            <ConfigProvider session={allowedSession} type="transactions">
                <div>{CHILD_TEXT}</div>
            </ConfigProvider>
        );

        await screen.findByText(CHILD_TEXT);

        rerender(
            <ConfigProvider session={deniedSession} type="transactions">
                <div>{CHILD_TEXT}</div>
            </ConfigProvider>
        );

        expect(screen.queryByText(CHILD_TEXT)).not.toBeInTheDocument();

        rerender(
            <ConfigProvider session={deniedSession}>
                <div>{CHILD_TEXT}</div>
            </ConfigProvider>
        );

        await waitFor(() => {
            expect(screen.getByText(CHILD_TEXT)).toBeInTheDocument();
        });
    });
});

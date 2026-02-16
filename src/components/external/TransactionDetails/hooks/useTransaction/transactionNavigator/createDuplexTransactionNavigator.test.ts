import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDuplexTransactionNavigator } from './createDuplexTransactionNavigator';

describe('createDuplexTransactionNavigator', () => {
    let navigator: ReturnType<typeof createDuplexTransactionNavigator>;
    const onNavigationMock = vi.fn();

    beforeEach(() => {
        navigator = createDuplexTransactionNavigator();
        navigator.onNavigation = onNavigationMock;
        vi.clearAllMocks();
    });

    it('should initialize with default state', () => {
        expect(navigator.currentTransaction).toBeUndefined();
        expect(navigator.canNavigateBackward).toBe(false);
        expect(navigator.canNavigateForward).toBe(false);
    });

    it('should set up navigation when reset is called', () => {
        navigator.reset('tx1', 'tx2');

        expect(navigator.currentTransaction).toBe('tx1');
        expect(navigator.canNavigateForward).toBe(true);
        expect(navigator.canNavigateBackward).toBe(false);

        expect(onNavigationMock).toHaveBeenCalledTimes(1);
        const navigationArg = onNavigationMock.mock.calls[0]![0];
        expect(navigationArg.from).toBeUndefined();
        expect(navigationArg.to).toBe('tx1');
    });

    it('should navigate forward', () => {
        navigator.reset('tx1', 'tx2');
        onNavigationMock.mockClear();

        navigator.forward();

        expect(navigator.currentTransaction).toBe('tx2');
        expect(navigator.canNavigateForward).toBe(false);
        expect(navigator.canNavigateBackward).toBe(true);

        expect(onNavigationMock).toHaveBeenCalledTimes(1);
        const navigationArg = onNavigationMock.mock.calls[0]![0];
        expect(navigationArg.from).toBe('tx1');
        expect(navigationArg.to).toBe('tx2');
    });

    it('should navigate backward', () => {
        navigator.reset('tx1', 'tx2');
        navigator.forward();
        onNavigationMock.mockClear();

        navigator.backward();

        expect(navigator.currentTransaction).toBe('tx1');
        expect(navigator.canNavigateForward).toBe(true);
        expect(navigator.canNavigateBackward).toBe(false);

        expect(onNavigationMock).toHaveBeenCalledTimes(1);
        const navigationArg = onNavigationMock.mock.calls[0]![0];
        expect(navigationArg.from).toBe('tx2');
        expect(navigationArg.to).toBe('tx1');
    });

    it('should not navigate forward if not allowed', () => {
        navigator.reset('tx1', 'tx2');
        navigator.forward();
        onNavigationMock.mockClear();

        navigator.forward();

        expect(navigator.currentTransaction).toBe('tx2');
        expect(onNavigationMock).not.toHaveBeenCalled();
    });

    it('should not navigate backward if not allowed', () => {
        navigator.reset('tx1', 'tx2');
        onNavigationMock.mockClear();

        navigator.backward();

        expect(navigator.currentTransaction).toBe('tx1');
        expect(onNavigationMock).not.toHaveBeenCalled();
    });

    it('should preserve current transaction on reset if it matches new ids (to)', () => {
        navigator.reset('tx1', 'tx2');
        navigator.forward(); // At tx2
        onNavigationMock.mockClear();

        navigator.reset('tx1', 'tx2');

        expect(navigator.currentTransaction).toBe('tx2');
        expect(onNavigationMock).not.toHaveBeenCalled();
    });

    it('should preserve current transaction on reset if it matches new ids (from)', () => {
        navigator.reset('tx1', 'tx2');
        // At tx1
        onNavigationMock.mockClear();

        navigator.reset('tx1', 'tx2');

        expect(navigator.currentTransaction).toBe('tx1');
        expect(onNavigationMock).not.toHaveBeenCalled();
    });

    it('should reset to fromTransactionId if current does not match new ids', () => {
        navigator.reset('tx1', 'tx2');
        onNavigationMock.mockClear();

        navigator.reset('tx3', 'tx4');

        expect(navigator.currentTransaction).toBe('tx3');
        expect(onNavigationMock).toHaveBeenCalledTimes(1);
        const navigationArg = onNavigationMock.mock.calls[0]![0];
        expect(navigationArg.from).toBeUndefined();
        expect(navigationArg.to).toBe('tx3');
    });

    it('should handle empty strings in reset', () => {
        navigator.reset('', '');

        expect(navigator.currentTransaction).toBeUndefined();
        expect(navigator.canNavigateForward).toBe(false);
        expect(navigator.canNavigateBackward).toBe(false);
        expect(onNavigationMock).not.toHaveBeenCalled();
    });

    it('should handle partial empty strings in reset', () => {
        navigator.reset('tx1', '');
        expect(navigator.currentTransaction).toBeUndefined();
        expect(onNavigationMock).not.toHaveBeenCalled();

        navigator.reset('', 'tx2');
        expect(navigator.currentTransaction).toBeUndefined();
        expect(onNavigationMock).not.toHaveBeenCalled();
    });

    it('should trigger callback when setting a new callback function', () => {
        navigator.reset('tx1', 'tx2');
        const newCallback = vi.fn();

        navigator.onNavigation = newCallback;

        expect(newCallback).toHaveBeenCalledTimes(1);
        const navigationArg = newCallback.mock.calls[0]![0];
        expect(navigationArg.from).toBeUndefined();
        expect(navigationArg.to).toBe('tx1');
    });

    it('should not trigger callback when setting nullish callback', () => {
        navigator.reset('tx1', 'tx2');
        onNavigationMock.mockClear();

        navigator.onNavigation = null;
        expect(onNavigationMock).not.toHaveBeenCalled();

        navigator.onNavigation = undefined;
        expect(onNavigationMock).not.toHaveBeenCalled();
    });

    it('should not trigger callback when setting callback if current transaction is undefined', () => {
        const newCallback = vi.fn();
        navigator.onNavigation = newCallback;
        expect(newCallback).not.toHaveBeenCalled();
    });
});

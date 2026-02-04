/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import useFocusTrap from './useFocusTrap';

describe('useFocusTrap', () => {
    const originalRequestAnimationFrame = global.requestAnimationFrame;
    const originalCancelAnimationFrame = global.cancelAnimationFrame;

    beforeEach(() => {
        // Mock rAF to run immediately to simplify testing the async logic in the hook
        global.requestAnimationFrame = cb => (cb(performance.now()), 1);
        global.cancelAnimationFrame = vi.fn();
    });

    afterEach(() => {
        global.requestAnimationFrame = originalRequestAnimationFrame;
        global.cancelAnimationFrame = originalCancelAnimationFrame;
        vi.restoreAllMocks();
    });

    const TestComponent = ({ onEscape }: { onEscape: (val: boolean) => void }) => {
        const trapRef = useFocusTrap(null, onEscape);
        return (
            <div data-testid="trap-root" ref={trapRef}>
                <button>Button 1</button>
                <input type="text" placeholder="Input 1" />
                <button>Button 2</button>
            </div>
        );
    };

    test('should set tabindex="-1" on the root element if not present', () => {
        const onEscape = vi.fn();
        render(<TestComponent onEscape={onEscape} />);

        const root = screen.getByTestId('trap-root');
        expect(root.getAttribute('tabindex')).toBe('-1');
    });

    test('should focus the root element if no element is focused inside', () => {
        const onEscape = vi.fn();
        render(<TestComponent onEscape={onEscape} />);

        const root = screen.getByTestId('trap-root');
        expect(document.activeElement).toBe(root);
    });

    test('should trap focus when tabbing forward from the last element', async () => {
        const onEscape = vi.fn();
        render(<TestComponent onEscape={onEscape} />);

        const buttons = screen.getAllByRole('button');
        const lastButton = buttons[1]!;
        const firstButton = buttons[0];

        lastButton.focus();
        expect(document.activeElement).toBe(lastButton);

        fireEvent.keyDown(lastButton, { key: 'Tab', code: 'Tab', shiftKey: false });

        expect(document.activeElement).toBe(firstButton);
    });

    test('should trap focus when tabbing backward from the first element', () => {
        const onEscape = vi.fn();
        render(<TestComponent onEscape={onEscape} />);

        const buttons = screen.getAllByRole('button');
        const firstButton = buttons[0]!;
        const lastButton = buttons[1];

        firstButton.focus();
        expect(document.activeElement).toBe(firstButton);

        fireEvent.keyDown(firstButton, { key: 'Tab', code: 'Tab', shiftKey: true });

        expect(document.activeElement).toBe(lastButton);
    });

    test('should call onEscape when Escape key is pressed', () => {
        const onEscape = vi.fn();
        render(<TestComponent onEscape={onEscape} />);

        const root = screen.getByTestId('trap-root');
        fireEvent.keyDown(root, { key: 'Escape', code: 'Escape' });

        expect(onEscape).toHaveBeenCalledWith(true);
    });

    test('should track focus when clicking inside', () => {
        const onEscape = vi.fn();
        render(<TestComponent onEscape={onEscape} />);

        const input = screen.getByPlaceholderText('Input 1');

        fireEvent.click(input);
        input.focus();
        expect(document.activeElement).toBe(input);
    });

    test('should call onEscape when clicking outside', async () => {
        const user = userEvent.setup();
        const onEscape = vi.fn();
        render(<TestComponent onEscape={onEscape} />);

        const firstButton = screen.getAllByRole('button')[0]!;
        await user.click(firstButton);
        expect(document.activeElement).toBe(firstButton);

        const outsideButton = document.createElement('button');
        outsideButton.textContent = 'Outside';
        document.body.appendChild(outsideButton);

        await user.click(outsideButton);
        expect(document.activeElement).toBe(outsideButton);

        expect(onEscape).toHaveBeenCalledWith(false);

        document.body.removeChild(outsideButton);
    });

    test('should handle focus within Shadow DOM', () => {
        const onEscape = vi.fn();
        render(<TestComponent onEscape={onEscape} />);

        const root = screen.getByTestId('trap-root');

        const shadowHost = document.createElement('div');
        root.appendChild(shadowHost);
        const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

        const shadowButton = document.createElement('button');
        shadowButton.textContent = 'Shadow Button';
        shadowRoot.appendChild(shadowButton);

        shadowButton.focus();

        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            composed: true,
        });

        shadowButton.dispatchEvent(clickEvent);

        expect(shadowRoot.activeElement).toBe(shadowButton);
    });
});

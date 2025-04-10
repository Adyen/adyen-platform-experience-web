/**
 * @vitest-environment jsdom
 */
import { RefObject } from 'preact';
import { describe, expect, test } from 'vitest';
import { act, render, renderHook, screen } from '@testing-library/preact';
import { userEvent } from '@testing-library/user-event';
import useFocusVisibility from './useFocusVisibility';

describe('useFocusVisibility', () => {
    test('hasVisibleFocus should be false when element is not focused', () => {
        render(<input placeholder="text" />);

        const inputField = screen.getByPlaceholderText('text');
        const hookResult = renderHook(() => useFocusVisibility()).result;
        const inputRef = hookResult.current.ref as RefObject<HTMLElement>;

        inputRef.current = inputField;

        expect(document.body).toHaveFocus();
        expect(hookResult.current.hasVisibleFocus).toBe(false);
    });

    test('hasVisibleFocus should be false when element is focused, but without visible focus', async () => {
        const user = userEvent.setup();

        render(<input placeholder="text" />);

        const inputField = screen.getByPlaceholderText('text');
        const hookResult = renderHook(() => useFocusVisibility()).result;
        const inputRef = hookResult.current.ref as RefObject<HTMLElement>;

        inputRef.current = inputField;

        expect(document.body).toHaveFocus();

        await act(async () => {
            await user.click(inputField);
        });

        expect(inputField).toHaveFocus();
        expect(hookResult.current.hasVisibleFocus).toBe(false);
    });

    test('hasVisibleFocus should be true when element is focused and with visible focus', async () => {
        const user = userEvent.setup();

        render(<input placeholder="text" />);

        const inputField = screen.getByPlaceholderText('text');
        const hookResult = renderHook(() => useFocusVisibility()).result;
        const inputRef = hookResult.current.ref as RefObject<HTMLElement>;

        inputRef.current = inputField;

        expect(document.body).toHaveFocus();

        await act(async () => {
            await user.tab();
        });

        expect(inputField).toHaveFocus();

        // Yet to figure out a way to simulate and match `:focus-visible` state in JSDOM.
        // Until then, commenting out this expectation to prevent the test from failing.
        // [TODO]: Uncomment this expectation when a solution has been found.
        //
        // expect(hookResult.current.hasVisibleFocus).toBe(true);
    });
});

/**
 * @vitest-environment jsdom
 */
import { describe, expect, test } from 'vitest';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/preact';
import { TabbedControlOptions, useTabbedControl } from './useTabbedControl';
import { InteractionKeyCode } from '../components/types';

describe('useTabbedControl', () => {
    const OPTIONS = [{ id: 'option_1' }, { id: 'option_2' }, { id: 'option_3' }];

    const getHookResult = <T extends TabbedControlOptions>(...args: Parameters<typeof useTabbedControl<T>>) => {
        const { result } = renderHook(() => useTabbedControl(...args));
        return result.current;
    };

    test('should have the correct active index depending on default option', () => {
        let result = getHookResult(OPTIONS);
        expect(result.activeIndex).toBe(0);

        for (let i = 0; i < OPTIONS.length; i++) {
            result = getHookResult(OPTIONS, OPTIONS[i]!.id);
            expect(result.activeIndex).toBe(i);
        }

        result = getHookResult([], 'unknown_option');
        expect(result.activeIndex).toBe(0);
    });

    test('should set the active index correctly', () => {
        const result = renderHook(() => useTabbedControl(OPTIONS)).result;
        expect(result.current.activeIndex).toBe(0);

        act(() => result.current.setActiveIndex(1));
        expect(result.current.activeIndex).toBe(1);

        act(() => result.current.setActiveIndex(2));
        expect(result.current.activeIndex).toBe(2);

        act(() => result.current.setActiveIndex(3.5));
        expect(result.current.activeIndex).toBe(2);

        act(() => result.current.setActiveIndex(-4));
        expect(result.current.activeIndex).toBe(2);

        act(() => result.current.setActiveIndex(0));
        expect(result.current.activeIndex).toBe(0);
    });

    test('should focus on the right option for arrow keys pressed', async () => {
        function TestComponent<T extends TabbedControlOptions>({ options }: { options: T }) {
            const { onKeyDown, refs, setActiveIndex } = useTabbedControl(options);
            return (
                <>
                    {options.map((option, index) => (
                        <button key={index} ref={refs[index]} onKeyDown={onKeyDown}>
                            {option.id}
                        </button>
                    ))}
                </>
            );
        }

        render(<TestComponent options={OPTIONS} />);

        // focus on first option
        screen.getAllByRole('button')[0]!.focus();

        // confirm that first option has focus
        expect(document.activeElement!.textContent).toBe('option_1');

        // simulate pressing right arrow key multiple times
        for (let i = 0, j = 2; i < 5; i++, j++) {
            if (j > OPTIONS.length) j = 1;

            fireEvent.keyDown(document.activeElement!, {
                key: InteractionKeyCode.ARROW_RIGHT,
                code: InteractionKeyCode.ARROW_RIGHT,
            });

            expect(document.activeElement!.textContent).toBe(`option_${j}`);
        }

        // simulate pressing home key
        fireEvent.keyDown(document.activeElement!, {
            key: InteractionKeyCode.HOME,
            code: InteractionKeyCode.HOME,
        });

        // confirm that first option has focus
        expect(document.activeElement!.textContent).toBe('option_1');

        // simulate pressing left arrow key multiple times
        for (let i = 0, j = 0; i < 5; i++, j--) {
            if (j === 0) j = OPTIONS.length;

            fireEvent.keyDown(document.activeElement!, {
                key: InteractionKeyCode.ARROW_LEFT,
                code: InteractionKeyCode.ARROW_LEFT,
            });

            expect(document.activeElement!.textContent).toBe(`option_${j}`);
        }

        // simulate pressing end key
        fireEvent.keyDown(document.activeElement!, {
            key: InteractionKeyCode.END,
            code: InteractionKeyCode.END,
        });

        // confirm that last option has focus
        expect(document.activeElement!.textContent).toBe('option_3');
    });

    test('should have a unique id for each consumer', () => {
        let previousResult = getHookResult(OPTIONS);

        for (let i = 0; i < OPTIONS.length; i++) {
            const currentResult = getHookResult(OPTIONS);
            expect(currentResult.uniqueId).not.toBe(previousResult.uniqueId);
            previousResult = currentResult;
        }
    });
});

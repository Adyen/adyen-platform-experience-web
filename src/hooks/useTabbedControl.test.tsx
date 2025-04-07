/**
 * @vitest-environment jsdom
 */
import { describe, expect, test } from 'vitest';
import { fireEvent, render, renderHook, screen } from '@testing-library/preact';
import { TabbedControlOptions, useTabbedControl } from './useTabbedControl';
import { InteractionKeyCode } from '../components/types';

function TestComponent<T extends TabbedControlOptions>({ options }: { options: T }) {
    const { activeIndex, onClick, onKeyDown, refs } = useTabbedControl(options);
    return (
        <>
            {options.map((option, index) => (
                <button key={index} ref={refs[index]} onClick={onClick} onKeyDown={onKeyDown} aria-checked={activeIndex === index}>
                    {option.id}
                </button>
            ))}
        </>
    );
}

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

    test('should activate the correct option for option clicked', () => {
        render(<TestComponent options={OPTIONS} />);

        for (const optionButton of screen.getAllByRole('button')) {
            fireEvent.click(optionButton);
            expect(optionButton.getAttribute('aria-checked')).toBe('true');
        }
    });

    test('should focus on the right option for navigation key pressed', () => {
        render(<TestComponent options={OPTIONS} />);

        // focus on first option
        screen.getAllByRole('button')[0]!.focus();

        // confirm that first option has focus
        expect(document.activeElement!.textContent).toBe('option_1');
        expect(document.activeElement!.getAttribute('aria-checked')).toBe('true');

        // simulate pressing right arrow key multiple times
        for (let i = 0, j = 2; i < 5; i++, j++) {
            if (j > OPTIONS.length) j = 1;

            fireEvent.keyDown(document.activeElement!, {
                key: InteractionKeyCode.ARROW_RIGHT,
                code: InteractionKeyCode.ARROW_RIGHT,
            });

            expect(document.activeElement!.textContent).toBe(`option_${j}`);
            expect(document.activeElement!.getAttribute('aria-checked')).toBe('true');
        }

        // simulate pressing home key
        fireEvent.keyDown(document.activeElement!, {
            key: InteractionKeyCode.HOME,
            code: InteractionKeyCode.HOME,
        });

        // confirm that first option has focus
        expect(document.activeElement!.textContent).toBe('option_1');
        expect(document.activeElement!.getAttribute('aria-checked')).toBe('true');

        // simulate pressing left arrow key multiple times
        for (let i = 0, j = 0; i < 5; i++, j--) {
            if (j === 0) j = OPTIONS.length;

            fireEvent.keyDown(document.activeElement!, {
                key: InteractionKeyCode.ARROW_LEFT,
                code: InteractionKeyCode.ARROW_LEFT,
            });

            expect(document.activeElement!.textContent).toBe(`option_${j}`);
            expect(document.activeElement!.getAttribute('aria-checked')).toBe('true');
        }

        // simulate pressing end key
        fireEvent.keyDown(document.activeElement!, {
            key: InteractionKeyCode.END,
            code: InteractionKeyCode.END,
        });

        // confirm that last option has focus
        expect(document.activeElement!.textContent).toBe('option_3');
        expect(document.activeElement!.getAttribute('aria-checked')).toBe('true');
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

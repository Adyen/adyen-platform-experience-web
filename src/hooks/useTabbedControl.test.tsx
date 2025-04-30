/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, vi } from 'vitest';
import { fireEvent, render, renderHook, screen } from '@testing-library/preact';
import { TabbedControlConfig, TabbedControlOptions, useTabbedControl } from './useTabbedControl';
import { InteractionKeyCode } from '../components/types';

function TestComponent<OptionId extends string, Options extends TabbedControlOptions<OptionId>>({
    options,
    ...restProps
}: TabbedControlConfig<OptionId, Options>) {
    const { activeIndex, onClick, onKeyDown, refs } = useTabbedControl({ options, ...restProps });
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

    const getHookResult = <OptionId extends string, Options extends TabbedControlOptions<OptionId>>(
        ...args: Parameters<typeof useTabbedControl<OptionId, Options>>
    ) => {
        const { result } = renderHook(() => useTabbedControl(...args));
        return result.current;
    };

    test('should have the correct active index depending on default option', () => {
        let result = getHookResult({ options: OPTIONS });
        expect(result.activeIndex).toBe(0);

        for (let i = 0; i < OPTIONS.length; i++) {
            result = getHookResult({ options: OPTIONS, defaultOption: OPTIONS[i]!.id });
            expect(result.activeIndex).toBe(i);
        }

        result = getHookResult({ options: [], defaultOption: 'unknown_option' });
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
        let previousResult = getHookResult({ options: OPTIONS });

        for (let i = 0; i < OPTIONS.length; i++) {
            const currentResult = getHookResult({ options: OPTIONS });
            expect(currentResult.uniqueId).not.toBe(previousResult.uniqueId);
            previousResult = currentResult;
        }
    });

    test('should trigger onChange callback with the active option', () => {
        const lastOption = OPTIONS[OPTIONS.length - 1];
        const onChange = vi.fn();

        render(<TestComponent options={OPTIONS} defaultOption={lastOption?.id} onChange={onChange} />);

        const optionButtons = screen.getAllByRole('button');

        for (let i = 0; i < OPTIONS.length; i++) {
            fireEvent.click(optionButtons[i]!);
            expect(onChange).toHaveBeenCalledTimes(i + 1);
            expect(onChange).toHaveBeenLastCalledWith(OPTIONS[i]);
        }
    });

    test('should only trigger onChange callback when active option changed', () => {
        const lastOption = OPTIONS[OPTIONS.length - 1];
        const onChange = vi.fn();

        let clickOptionIndex = 1;

        const { rerender } = render(<TestComponent options={OPTIONS} defaultOption={lastOption?.id} onChange={onChange} />);

        expect(onChange).not.toHaveBeenCalled();

        fireEvent.click(screen.getAllByRole('button')[clickOptionIndex]!);

        expect(onChange).toHaveBeenCalledOnce();
        expect(onChange).toHaveBeenLastCalledWith(OPTIONS[clickOptionIndex]);

        const onChange2 = vi.fn();

        clickOptionIndex = 0;

        rerender(<TestComponent options={OPTIONS} defaultOption={lastOption?.id} onChange={onChange2} />);

        expect(onChange2).not.toHaveBeenCalled();

        fireEvent.click(screen.getAllByRole('button')[clickOptionIndex]!);

        expect(onChange2).toHaveBeenCalledOnce();
        expect(onChange2).toHaveBeenLastCalledWith(OPTIONS[clickOptionIndex]);
    });
});

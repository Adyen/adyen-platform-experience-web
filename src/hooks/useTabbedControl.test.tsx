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
        <div role="radiogroup">
            {options.map((option, index) => (
                <button role="radio" key={index} ref={refs[index]} onClick={onClick} onKeyDown={onKeyDown} aria-checked={activeIndex === index}>
                    {option.id}
                </button>
            ))}
        </div>
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
            result = getHookResult({ options: OPTIONS, activeOption: OPTIONS[i]!.id });
            expect(result.activeIndex).toBe(i);
        }

        result = getHookResult({ options: [], activeOption: 'unknown_option' });
        expect(result.activeIndex).toBe(0);
    });

    test('should activate the correct option for option clicked', () => {
        render(<TestComponent options={OPTIONS} />);

        for (const optionButton of screen.getAllByRole('radio')) {
            fireEvent.click(optionButton);
            expect(optionButton.getAttribute('aria-checked')).toBe('true');
        }
    });

    test('should focus on the right option for navigation key pressed', () => {
        const expectToBeFocused = (element: HTMLElement) => {
            expect(element).toHaveAttribute('aria-checked', 'true');
            expect(element).toHaveFocus();
        };

        render(<TestComponent options={OPTIONS} />);

        const radios = screen.getAllByRole('radio');
        const firstOption = radios[0]!;

        // focus on first option
        firstOption.focus();

        // confirm that first option has focus
        expectToBeFocused(firstOption);

        let currentFocused = firstOption;

        // simulate pressing right arrow key multiple times
        for (let i = 0, j = 2; i < 5; i++, j++) {
            if (j > OPTIONS.length) j = 1;

            fireEvent.keyDown(currentFocused, {
                key: InteractionKeyCode.ARROW_RIGHT,
                code: InteractionKeyCode.ARROW_RIGHT,
            });

            currentFocused = radios[j - 1]!;
            expectToBeFocused(currentFocused);
        }

        // simulate pressing home key
        fireEvent.keyDown(currentFocused, {
            key: InteractionKeyCode.HOME,
            code: InteractionKeyCode.HOME,
        });

        // confirm that first option has focus
        currentFocused = firstOption;
        expectToBeFocused(currentFocused);

        // simulate pressing left arrow key multiple times
        for (let i = 0, j = 0; i < 5; i++, j--) {
            if (j === 0) j = OPTIONS.length;

            fireEvent.keyDown(currentFocused, {
                key: InteractionKeyCode.ARROW_LEFT,
                code: InteractionKeyCode.ARROW_LEFT,
            });

            currentFocused = radios[j - 1]!;
            expectToBeFocused(currentFocused);
        }

        // simulate pressing end key
        fireEvent.keyDown(currentFocused, {
            key: InteractionKeyCode.END,
            code: InteractionKeyCode.END,
        });

        // confirm that last option has focus
        currentFocused = radios[OPTIONS.length - 1]!;
        expectToBeFocused(currentFocused);
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

        render(<TestComponent options={OPTIONS} activeOption={lastOption?.id} onChange={onChange} />);

        const optionButtons = screen.getAllByRole('radio');

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

        const { rerender } = render(<TestComponent options={OPTIONS} activeOption={lastOption?.id} onChange={onChange} />);

        expect(onChange).not.toHaveBeenCalled();

        fireEvent.click(screen.getAllByRole('radio')[clickOptionIndex]!);

        expect(onChange).toHaveBeenCalledOnce();
        expect(onChange).toHaveBeenLastCalledWith(OPTIONS[clickOptionIndex]);

        const onChange2 = vi.fn();

        clickOptionIndex = 0;

        rerender(<TestComponent options={OPTIONS} activeOption={lastOption?.id} onChange={onChange2} />);

        expect(onChange2).not.toHaveBeenCalled();

        fireEvent.click(screen.getAllByRole('radio')[clickOptionIndex]!);

        expect(onChange2).toHaveBeenCalledOnce();
        expect(onChange2).toHaveBeenLastCalledWith(OPTIONS[clickOptionIndex]);
    });
});

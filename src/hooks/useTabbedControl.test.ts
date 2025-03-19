/**
 * @vitest-environment jsdom
 */
import { describe, expect, test } from 'vitest';
import { act, fireEvent, renderHook } from '@testing-library/preact';
import { TabbedControlOptions, useTabbedControl } from './useTabbedControl';

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

    test.todo('should set the active index correctly for keydown events', () => {});

    test('should have a unique id for each consumer', () => {
        let previousResult = getHookResult(OPTIONS);

        for (let i = 0; i < OPTIONS.length; i++) {
            const currentResult = getHookResult(OPTIONS);
            expect(currentResult.uniqueId).not.toBe(previousResult.uniqueId);
            previousResult = currentResult;
        }
    });
});

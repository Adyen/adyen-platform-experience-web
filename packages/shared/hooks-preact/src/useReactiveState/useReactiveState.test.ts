/**
 * @vitest-environment jsdom
 */
import { expect, test, vi } from 'vitest';
import { renderHook } from '@testing-library/preact';
import useReactiveState from './useReactiveState';

test('does not reset unchanged state after mounting', () => {
    const params = Object.freeze({ status: 'active' });
    const renderState = vi.fn(() => useReactiveState(params));

    renderHook(renderState);
    expect(renderState).toHaveBeenCalledOnce();
});

test('resets state when params change', () => {
    const initialParams: Readonly<{ status: string }> = Object.freeze({ status: 'active' });
    const updatedParams: Readonly<{ status: string }> = Object.freeze({ status: 'inactive' });

    const { result, rerender } = renderHook(({ params }) => useReactiveState(params), {
        initialProps: { params: initialParams },
    });

    rerender({ params: updatedParams });
    expect(result.current.state).toEqual(updatedParams);
});

test('preserves state when equivalent params are replaced', () => {
    const initialParams: Readonly<{ status: string }> = Object.freeze({ status: 'active' });
    const updatedParams: Readonly<{ status: string }> = Object.freeze({ status: 'active' });

    const { result, rerender } = renderHook(({ params }) => useReactiveState(params), {
        initialProps: { params: initialParams },
    });

    const initialState = result.current.state;

    rerender({ params: updatedParams });
    expect(result.current.state).toBe(initialState);
    expect(result.current.state).toEqual(updatedParams);
});

test('does not rerender indefinitely when equivalent params are recreated during render', () => {
    const renderState = vi.fn(() => useReactiveState({ status: 'active' }));
    const { rerender } = renderHook(renderState);

    rerender();
    expect(renderState).toHaveBeenCalledTimes(2);
});

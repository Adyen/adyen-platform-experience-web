/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { act, renderHook } from '@testing-library/preact';
import { SelectItem } from '../components/internal/FormFields/Select/types';
import useFilterAnalyticsEvent from './useAnalytics/useFilterAnalyticsEvent';
import useMultiSelectionFilterProps from './useMultiSelectionFilterProps';

vi.mock('./useAnalytics/useFilterAnalyticsEvent');

describe('useMultiSelectionFilterProps', () => {
    const mockLogEvent = vi.fn();
    const mockOnResetFilter = vi.fn();
    const mockOnUpdateFilter = vi.fn();

    const selectionOptions: readonly SelectItem[] = [
        { id: 'A', name: 'Option A' },
        { id: 'B', name: 'Option B' },
        { id: 'C', name: 'Option C' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useFilterAnalyticsEvent).mockReturnValue({ logEvent: mockLogEvent });
    });

    test('should return the initial selection and options', () => {
        const { result } = renderHook(() =>
            useMultiSelectionFilterProps({
                selection: ['A'],
                selectionOptions,
            })
        );

        expect(result.current.selection).toEqual(['A']);
        expect(result.current.selectionOptions).toEqual(selectionOptions);
    });

    test('should call onUpdateFilter with the sorted selection when an item is selected', () => {
        const { result } = renderHook(() =>
            useMultiSelectionFilterProps({
                selection: ['A'],
                selectionOptions,
                onUpdateFilter: mockOnUpdateFilter,
            })
        );

        act(() => result.current.updateSelection({ target: { value: 'C,A' } }));

        expect(mockOnUpdateFilter).toHaveBeenCalledOnce();
        expect(mockOnUpdateFilter).toHaveBeenCalledWith(['A', 'C']);
        expect(mockLogEvent).toHaveBeenCalledWith('update', 'A,C');
    });

    test('should call onUpdateFilter when an item is deselected', () => {
        const { result } = renderHook(() =>
            useMultiSelectionFilterProps({
                selection: ['A', 'B'],
                selectionOptions,
                onUpdateFilter: mockOnUpdateFilter,
            })
        );

        act(() => result.current.updateSelection({ target: { value: 'A' } }));

        expect(mockOnUpdateFilter).toHaveBeenCalledOnce();
        expect(mockOnUpdateFilter).toHaveBeenCalledWith(['A']);
        expect(mockLogEvent).toHaveBeenCalledWith('update', 'A');
    });

    test('should not call onUpdateFilter if the selection has not changed', () => {
        const { result } = renderHook(() =>
            useMultiSelectionFilterProps({
                selection: ['A', 'B'],
                selectionOptions,
                onUpdateFilter: mockOnUpdateFilter,
            })
        );

        act(() => result.current.updateSelection({ target: { value: 'A,B' } }));

        expect(mockOnUpdateFilter).not.toHaveBeenCalled();
        expect(mockLogEvent).not.toHaveBeenCalled();
    });

    test('should handle updateSelection with a single string value', () => {
        const { result } = renderHook(() =>
            useMultiSelectionFilterProps({
                selection: ['A'],
                selectionOptions,
                onUpdateFilter: mockOnUpdateFilter,
            })
        );

        act(() => result.current.updateSelection({ target: { value: 'B' } }));

        expect(mockOnUpdateFilter).toHaveBeenCalledWith(['B']);
        expect(mockLogEvent).toHaveBeenCalledWith('update', 'B');
    });

    test('should handle updateSelection with an empty target value', () => {
        const { result } = renderHook(() =>
            useMultiSelectionFilterProps({
                selection: ['A'],
                selectionOptions,
                onUpdateFilter: mockOnUpdateFilter,
                onResetFilter: mockOnResetFilter,
            })
        );

        act(() => result.current.updateSelection({ target: { value: '' } }));

        expect(mockOnResetFilter).not.toHaveBeenCalled();
        expect(mockOnUpdateFilter).toHaveBeenCalledOnce();
        expect(mockOnUpdateFilter).toHaveBeenCalledWith([]);
        expect(mockLogEvent).toHaveBeenCalledWith('update', '');
    });

    test('should call onResetFilter when onResetAction is called with an active selection', () => {
        const { result } = renderHook(() =>
            useMultiSelectionFilterProps({
                selection: ['A', 'B'],
                selectionOptions,
                onUpdateFilter: mockOnUpdateFilter,
                onResetFilter: mockOnResetFilter,
            })
        );

        act(() => result.current.onResetAction());

        expect(mockOnUpdateFilter).not.toHaveBeenCalled();
        expect(mockOnResetFilter).toHaveBeenCalledOnce();
        expect(mockLogEvent).toHaveBeenCalledWith('reset');
    });

    test('should not call onResetFilter when onResetAction is called with no active selection', () => {
        const { result } = renderHook(() =>
            useMultiSelectionFilterProps({
                selection: [],
                selectionOptions,
                onResetFilter: mockOnResetFilter,
            })
        );

        act(() => result.current.onResetAction());

        expect(mockOnResetFilter).not.toHaveBeenCalled();
        expect(mockLogEvent).not.toHaveBeenCalled();
    });
});

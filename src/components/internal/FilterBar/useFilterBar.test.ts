/**
 * @vitest-environment jsdom
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/preact';
import { useFilterBarState } from './useFilterBar';

// Mock dependencies
vi.mock('../../../hooks/useResponsiveContainer', () => ({
    useResponsiveContainer: vi.fn(),
    containerQueries: {
        down: {
            xs: 'mock-xs-query',
        },
    },
}));

import { useResponsiveContainer } from '../../../hooks/useResponsiveContainer';

const mockUseResponsiveContainer = vi.mocked(useResponsiveContainer);

describe('useFilterBarState', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseResponsiveContainer.mockReturnValue(false);
    });

    describe('Initial state', () => {
        test('returns correct initial state when not mobile', () => {
            mockUseResponsiveContainer.mockReturnValue(false);

            const { result } = renderHook(() => useFilterBarState());

            expect(result.current.isMobileContainer).toBe(false);
            expect(result.current.showingFilters).toBe(true);
            expect(result.current.setShowingFilters).toEqual(expect.any(Function));
        });

        test('returns correct initial state when mobile', () => {
            mockUseResponsiveContainer.mockReturnValue(true);

            const { result } = renderHook(() => useFilterBarState());

            expect(result.current.isMobileContainer).toBe(true);
            expect(result.current.showingFilters).toBe(false);
            expect(result.current.setShowingFilters).toEqual(expect.any(Function));
        });
    });

    describe('Responsive behavior', () => {
        test('updates showingFilters when isMobileContainer changes from false to true', () => {
            mockUseResponsiveContainer.mockReturnValue(false);

            const { result, rerender } = renderHook(() => useFilterBarState());

            expect(result.current.showingFilters).toBe(true);

            // Simulate container becoming mobile
            mockUseResponsiveContainer.mockReturnValue(true);
            rerender();

            expect(result.current.showingFilters).toBe(false);
        });

        test('updates showingFilters when isMobileContainer changes from true to false', () => {
            mockUseResponsiveContainer.mockReturnValue(true);

            const { result, rerender } = renderHook(() => useFilterBarState());

            expect(result.current.showingFilters).toBe(false);

            // Simulate container becoming desktop
            mockUseResponsiveContainer.mockReturnValue(false);
            rerender();

            expect(result.current.showingFilters).toBe(true);
        });
    });

    describe('State management', () => {
        test('allows manual control of showingFilters state', () => {
            mockUseResponsiveContainer.mockReturnValue(false);

            const { result } = renderHook(() => useFilterBarState());

            expect(result.current.showingFilters).toBe(true);

            act(() => {
                result.current.setShowingFilters(false);
            });

            expect(result.current.showingFilters).toBe(false);
        });
    });
});

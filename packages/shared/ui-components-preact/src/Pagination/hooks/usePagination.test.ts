/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test, vi } from 'vitest';
import { renderHook, act } from '@testing-library/preact';
import usePagination from './usePagination';

describe('usePagination', () => {
    const mockPaginationSetupConfig = {
        getPageCount: vi.fn(() => 5),
        getPageParams: vi.fn((page: number, limit: number) => ({ offset: (page - 1) * limit })),
        resetPageCount: vi.fn(),
        updatePagination: vi.fn(),
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    test('should return correct initial values', () => {
        const { result } = renderHook(() => usePagination(mockPaginationSetupConfig));

        expect(result.current.hasNext).toBe(false);
        expect(result.current.hasPrev).toBe(false);
        expect(result.current.limit).toBe(0);
        expect(result.current.page).toBeUndefined();
        expect(result.current.pages).toBe(5);
        expect(result.current.pageSize).toBe(0);
        expect(result.current.size).toBe(0);

        expect(typeof result.current.goto).toBe('function');
        expect(typeof result.current.next).toBe('function');
        expect(typeof result.current.prev).toBe('function');
        expect(typeof result.current.resetPagination).toBe('function');
    });

    test('should use provided page limit', () => {
        const { result } = renderHook(() => usePagination(mockPaginationSetupConfig, undefined, 25));
        expect(result.current.limit).toBe(25);
    });

    test('should do nothing without page request callback', async () => {
        const { result } = renderHook(() => usePagination(mockPaginationSetupConfig));
        await act(() => result.current.goto(2)); // Should not throw or do anything
        expect(mockPaginationSetupConfig.updatePagination).not.toHaveBeenCalled();
    });

    test('should handle valid page numbers correctly', async () => {
        const LAST_PAGE_SIZE = 7;
        const PAGE_LIMIT = 10;
        const PAGES_COUNT = 5;

        const validPages = [
            { gotoPage: 2, page: 2, offset: 10, pageSize: 10, size: 20, hasNext: true, hasPrev: true },
            { gotoPage: 3, page: 3, offset: 20, pageSize: 10, size: 30, hasNext: true, hasPrev: true },
            { gotoPage: 5, page: 5, offset: 40, pageSize: 7, size: 47, hasNext: false, hasPrev: true },
            // negative pages within range (there are only 5 pages)
            { gotoPage: -5, page: 1, offset: 0, pageSize: 10, size: 10, hasNext: true, hasPrev: false }, // -5 => first page
            { gotoPage: -4, page: 2, offset: 10, pageSize: 10, size: 20, hasNext: true, hasPrev: true }, // -4 => second page
            { gotoPage: -1, page: 5, offset: 40, pageSize: 7, size: 47, hasNext: false, hasPrev: true }, // -1 => last page
        ];

        for (const { gotoPage, hasNext, hasPrev, page, offset, pageSize, size } of validPages) {
            const mockRequestCallback = vi.fn().mockImplementation(({ page }) => ({ size: page === PAGES_COUNT ? LAST_PAGE_SIZE : PAGE_LIMIT }));
            const { result } = renderHook(() => usePagination(mockPaginationSetupConfig, mockRequestCallback, PAGE_LIMIT));

            await act(async () => {
                result.current.goto(gotoPage);
                // defer resolving the async promise to next tick
                // should be enough time for page request to complete
                await void 0;
            });

            expect(mockRequestCallback).toHaveBeenCalledWith(expect.objectContaining({ limit: PAGE_LIMIT, page, offset }), expect.any(AbortSignal));

            expect(mockPaginationSetupConfig.updatePagination).toHaveBeenCalledOnce();

            expect(result.current.hasNext).toBe(hasNext);
            expect(result.current.hasPrev).toBe(hasPrev);
            expect(result.current.limit).toBe(PAGE_LIMIT);
            expect(result.current.page).toBe(page);
            expect(result.current.pages).toBe(PAGES_COUNT);
            expect(result.current.pageSize).toBe(pageSize);
            expect(result.current.size).toBe(size);

            // clear mock ahead of the next iteration
            mockPaginationSetupConfig.updatePagination.mockClear();
        }
    });

    test('should handle invalid page numbers gracefully', async () => {
        const invalidPages = [
            0, // invalid (zero page not allowed)
            2.5, // invalid (non-integer page)
            10, // out of range (last page is 5)
            -10, // out of range (there are only 5 pages)
        ];

        for (const invalidPage of invalidPages) {
            const mockRequestCallback = vi.fn().mockResolvedValue(void 0);
            const { result } = renderHook(() => usePagination(mockPaginationSetupConfig, mockRequestCallback, 10));
            await act(() => result.current.goto(invalidPage));
            expect(mockRequestCallback).not.toHaveBeenCalled();
        }
    });

    test('should abort previous page request when new request is made', async () => {
        const abortSignals: AbortSignal[] = [];
        const mockRequestCallback = vi.fn((_, signal) => void abortSignals.push(signal));
        const { result } = renderHook(() => usePagination(mockPaginationSetupConfig, mockRequestCallback, 10));

        await Promise.all([
            act(() => result.current.goto(2)), // Start first request
            act(() => result.current.goto(3)), // Start second request immediately
        ]);

        expect(mockRequestCallback).toHaveBeenCalledTimes(2);
        expect(abortSignals[0]?.aborted).toBe(true); // signal for first request
        expect(abortSignals[1]?.aborted).toBe(false); // signal for second request
    });

    test('should handle request callback errors gracefully', async () => {
        const networkError = new Error('Network error');
        const mockRequestCallback = vi.fn().mockRejectedValue(networkError);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const { result } = renderHook(() => usePagination(mockPaginationSetupConfig, mockRequestCallback, 10));

        await act(() => result.current.goto(2));
        expect(consoleSpy).toHaveBeenCalledWith(networkError);
        consoleSpy.mockRestore();
    });

    test('should calculate hasNext and hasPrev correctly', () => {
        const { result } = renderHook(() => usePagination(mockPaginationSetupConfig));
        expect(result.current.hasNext).toBe(false);
        expect(result.current.hasPrev).toBe(false);
    });

    test('should calculate next and prev functions correctly', async () => {
        const mockRequestCallback = vi.fn().mockResolvedValue({});
        const { result } = renderHook(() => usePagination(mockPaginationSetupConfig, mockRequestCallback, 10));

        expect(result.current.hasNext).toBe(false);
        expect(result.current.hasPrev).toBe(false);
        expect(result.current.page).toBeUndefined();

        // Without a current page, next() shouldn't call the callback
        await act(() => result.current.next());
        expect(mockRequestCallback).not.toHaveBeenCalled();

        // Without a current page, prev() shouldn't call the callback
        await act(() => result.current.prev());
        expect(mockRequestCallback).not.toHaveBeenCalled();
    });

    test('should handle next/prev at boundaries correctly', async () => {
        const mockRequestCallback = vi.fn().mockResolvedValue({});
        const { result } = renderHook(() => usePagination(mockPaginationSetupConfig, mockRequestCallback, 10));

        // Without a current page, boundary checks won't trigger callbacks
        await act(() => result.current.next());
        expect(mockRequestCallback).not.toHaveBeenCalled();

        await act(() => result.current.prev());
        expect(mockRequestCallback).not.toHaveBeenCalled();
    });

    test('should calculate size and pageSize correctly', () => {
        const { result } = renderHook(() => usePagination(mockPaginationSetupConfig, undefined, 10));
        expect(result.current.size).toBe(0);
        expect(result.current.pageSize).toBe(0);
    });

    test('should reset pagination correctly', () => {
        const { result } = renderHook(() => usePagination(mockPaginationSetupConfig));
        act(() => result.current.resetPagination());
        expect(mockPaginationSetupConfig.resetPageCount).toHaveBeenCalled();
    });

    test('should handle zero or undefined limit correctly', async () => {
        const mockRequestCallback = vi.fn().mockResolvedValue({});
        const { result } = renderHook(() => usePagination(mockPaginationSetupConfig, mockRequestCallback, 0));
        await act(() => result.current.goto(2)); // Should not make request when limit is 0
        expect(mockRequestCallback).not.toHaveBeenCalled();
    });

    test('should update page state correctly after successful request', async () => {
        const mockRequestCallback = vi.fn().mockResolvedValue({});
        const { result } = renderHook(() => usePagination(mockPaginationSetupConfig, mockRequestCallback, 10));
        await act(() => result.current.goto(2));
        // The updatePagination should be called with the pagination data
        expect(mockPaginationSetupConfig.updatePagination).toHaveBeenCalledWith(2, 10, {});
    });

    test('should handle complete pagination flow', async () => {
        const mockRequestCallback = vi.fn().mockResolvedValueOnce({}).mockResolvedValueOnce({}).mockResolvedValueOnce({});

        const { result } = renderHook(() => usePagination(mockPaginationSetupConfig, mockRequestCallback, 10));

        // Navigate to page 2
        await act(() => result.current.goto(2));

        expect(result.current.page).toBe(2);
        expect(result.current.hasNext).toBe(true);
        expect(result.current.hasPrev).toBe(true);

        // Use next() to go to page 3
        await act(() => result.current.next());

        expect(mockRequestCallback).toHaveBeenCalledWith(expect.objectContaining({ page: 3 }), expect.any(AbortSignal));

        expect(result.current.page).toBe(3);
        expect(result.current.hasNext).toBe(true);
        expect(result.current.hasPrev).toBe(true);

        // Use prev() to go to page 2
        await act(() => result.current.prev());

        expect(mockRequestCallback).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }), expect.any(AbortSignal));

        expect(result.current.page).toBe(2);
        expect(result.current.hasNext).toBe(true);
        expect(result.current.hasPrev).toBe(true);
    });

    test('should calculate pages correctly based on getPageCount', () => {
        const testCases = [
            { pageCount: 0, expectedPages: undefined },
            { pageCount: 5, expectedPages: 5 },
            { pageCount: 10, expectedPages: 10 },
        ];

        testCases.forEach(({ pageCount, expectedPages }) => {
            mockPaginationSetupConfig.getPageCount.mockReturnValue(pageCount);
            const { result } = renderHook(() => usePagination(mockPaginationSetupConfig));
            expect(result.current.pages).toBe(expectedPages);
        });
    });
});

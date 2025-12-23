/**
 * @vitest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/preact';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { useStores } from './useStores';
import { useConfigContext } from '../core/ConfigContext';
import { useFetch } from './useFetch';
import { STORES } from '../../mocks/mock-data';

vi.mock('../core/ConfigContext');
vi.mock('./useFetch');

const mockUseConfigContext = vi.mocked(useConfigContext);
const mockUseFetch = vi.mocked(useFetch);

describe('useStores', () => {
    const mockGetStores = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseConfigContext.mockReturnValue({
            endpoints: {
                getPayByLinkStores: mockGetStores,
            },
        } as any);
    });

    test('should fetch stores when getPayByLinkStores is available', () => {
        mockUseFetch.mockReturnValue({ isFetching: false, refetch: vi.fn() });

        renderHook(() => useStores());

        expect(mockUseFetch).toHaveBeenCalledWith(
            expect.objectContaining({
                fetchOptions: { enabled: true },
                queryFn: expect.any(Function),
            })
        );
    });

    test('should transform store data correctly', async () => {
        const mockStoreData = {
            data: [
                {
                    storeCode: 'STORE001',
                    storeId: 'STORE_001',
                    description: 'Main Store',
                },
                {
                    storeCode: 'STORE002',
                    description: 'Secondary Store',
                },
            ],
        };

        mockUseFetch.mockReturnValue({ data: mockStoreData, isFetching: false, refetch: vi.fn() });

        const { result } = renderHook(() => useStores());

        expect(result.current.stores).toEqual([
            {
                storeCode: 'STORE001',
                description: 'Main Store',
                id: 'STORE_001',
                name: 'STORE001',
            },
            {
                storeCode: 'STORE002',
                description: 'Secondary Store',
                id: '',
                name: 'STORE002',
            },
        ]);
    });

    test('should set selectedStore to first store ID when stores are loaded', async () => {
        const mockStoreData = {
            data: STORES,
        };

        mockUseFetch.mockReturnValue({ data: mockStoreData, isFetching: false, refetch: vi.fn() });

        const { result } = renderHook(() => useStores());

        await waitFor(() => {
            expect(result.current.selectedStore).toBe('STORE_NY_001');
        });
    });

    test('should allow manual selection of store', async () => {
        const mockStoreData = {
            data: STORES,
        };

        mockUseFetch.mockReturnValue({ data: mockStoreData, isFetching: false, refetch: vi.fn() });

        const { result } = renderHook(() => useStores());

        await waitFor(() => {
            expect(result.current.selectedStore).toBe('STORE_NY_001');
        });

        act(() => {
            result.current.setSelectedStore('LN001');
        });

        expect(result.current.selectedStore).toBe('LN001');
    });

    test('should handle undefined data gracefully', () => {
        mockUseFetch.mockReturnValue({ data: undefined, isFetching: false, refetch: vi.fn() });

        const { result } = renderHook(() => useStores());

        expect(result.current.stores).toBeUndefined();
        expect(result.current.selectedStore).toBeUndefined();
    });

    test('should handle data without data property', () => {
        mockUseFetch.mockReturnValue({ data: {}, isFetching: false, refetch: vi.fn() });

        const { result } = renderHook(() => useStores());

        expect(result.current.stores).toBeUndefined();
        expect(result.current.selectedStore).toBeUndefined();
    });
});

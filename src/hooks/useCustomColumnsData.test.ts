/** @vitest-environment jsdom */
import { renderHook, waitFor } from '@testing-library/preact';
import { describe, it, expect, vi } from 'vitest';
import { useCustomColumnsData } from './useCustomColumnsData'; // Adjust the import path as needed

describe('useCustomColumnsData', () => {
    interface TestRecord {
        id: number;
        name: string;
        customField?: string;
    }

    const initialRecords: TestRecord[] = [
        { id: 1, name: 'Record 1' },
        { id: 2, name: 'Record 2' },
    ];

    const mockRetrievedData = [
        { id: 1, customValue: 'Custom A' },
        { id: 2, customValue: 'Custom B' },
    ];

    const mockMergeCustomData = vi.fn(({ records, retrievedData }: { records: TestRecord[]; retrievedData: any[] }) => {
        return records.map(record => {
            const custom = retrievedData.find(d => d.id === record.id);
            return { ...record, customField: custom?.customValue };
        });
    });

    it('should return initial records and loading as false by default', () => {
        const { result } = renderHook(() =>
            useCustomColumnsData({
                records: initialRecords,
                mergeCustomData: mockMergeCustomData,
            })
        );

        expect(result.current.customRecords).toEqual(initialRecords);
        expect(result.current.loadingCustomRecords).toBe(false);
    });

    it('should not fetch custom data when hasCustomColumn is false', async () => {
        const onDataRetrieve = vi.fn();
        const { result } = renderHook(() =>
            useCustomColumnsData({
                records: initialRecords,
                hasCustomColumn: false,
                onDataRetrieve,
                mergeCustomData: mockMergeCustomData,
            })
        );

        await waitFor(() => {
            expect(result.current.customRecords).toEqual(initialRecords);
        });

        expect(onDataRetrieve).not.toHaveBeenCalled();
        expect(mockMergeCustomData).not.toHaveBeenCalled();
    });

    it('should not fetch custom data when onDataRetrieve is not a function', async () => {
        const { result } = renderHook(() =>
            useCustomColumnsData({
                records: initialRecords,
                hasCustomColumn: true,
                onDataRetrieve: undefined,
                mergeCustomData: mockMergeCustomData,
            })
        );

        await waitFor(() => {
            expect(result.current.loadingCustomRecords).toBe(false);
        });

        expect(mockMergeCustomData).not.toHaveBeenCalled();
    });

    it('should fetch, merge, and update records when hasCustomColumn is true', async () => {
        const onDataRetrieve = vi.fn().mockResolvedValue(mockRetrievedData);

        const { result } = renderHook(() =>
            useCustomColumnsData({
                records: initialRecords,
                hasCustomColumn: true,
                onDataRetrieve,
                mergeCustomData: mockMergeCustomData,
            })
        );

        // Check loading state is activated
        expect(result.current.loadingCustomRecords).toBe(true);

        await waitFor(() => {
            expect(onDataRetrieve).toHaveBeenCalledWith(initialRecords);
        });

        await waitFor(() => {
            expect(mockMergeCustomData).toHaveBeenCalledWith({
                records: initialRecords,
                retrievedData: mockRetrievedData,
            });
        });

        await waitFor(() => {
            expect(result.current.loadingCustomRecords).toBe(false);
        });

        expect(result.current.customRecords).toEqual([
            { id: 1, name: 'Record 1', customField: 'Custom A' },
            { id: 2, name: 'Record 2', customField: 'Custom B' },
        ]);
    });

    it('should handle errors during data retrieval gracefully', async () => {
        const error = new Error('Failed to fetch');
        const onDataRetrieve = vi.fn().mockRejectedValue(error);

        const { result } = renderHook(() =>
            useCustomColumnsData({
                records: initialRecords,
                hasCustomColumn: true,
                onDataRetrieve,
                mergeCustomData: mockMergeCustomData,
            })
        );

        expect(result.current.loadingCustomRecords).toBe(true);

        await waitFor(() => {
            // loading should be set back to false
            expect(result.current.loadingCustomRecords).toBe(false);
        });

        // customRecords should remain the initial records
        expect(result.current.customRecords).toEqual(initialRecords);
    });

    it('should handle non-array data returned from onDataRetrieve', async () => {
        const onDataRetrieve = vi.fn().mockResolvedValue({ data: 'not an array' });

        const { result } = renderHook(() =>
            useCustomColumnsData({
                records: initialRecords,
                hasCustomColumn: true,
                onDataRetrieve,
                mergeCustomData: mockMergeCustomData,
            })
        );

        expect(result.current.loadingCustomRecords).toBe(true);

        await waitFor(() => {
            expect(result.current.loadingCustomRecords).toBe(false);
        });

        expect(result.current.customRecords).toEqual(initialRecords);
    });

    it('should re-fetch data when records prop changes', async () => {
        const onDataRetrieve = vi.fn().mockResolvedValue(mockRetrievedData);
        const newRecords = [...initialRecords, { id: 3, name: 'Record 3' }];

        const { rerender } = renderHook(
            ({ records }) =>
                useCustomColumnsData({
                    records,
                    hasCustomColumn: true,
                    onDataRetrieve,
                    mergeCustomData: mockMergeCustomData,
                }),
            { initialProps: { records: initialRecords } }
        );

        await waitFor(() => {
            expect(onDataRetrieve).toHaveBeenCalledTimes(1);
        });
        expect(onDataRetrieve).toHaveBeenCalledWith(initialRecords);

        // Rerender with new records
        rerender({ records: newRecords });

        await waitFor(() => {
            // Should be called again with the new records
            expect(onDataRetrieve).toHaveBeenCalledTimes(2);
        });
        expect(onDataRetrieve).toHaveBeenCalledWith(newRecords);
    });
});

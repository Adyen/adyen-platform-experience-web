import { effectScope, nextTick, ref } from 'vue';
import { afterEach, describe, expect, test, vi } from 'vitest';
import type { CustomDataRetrieved } from '@integration-components/types';
import { createDeferred } from '@integration-components/utils';
import { useCustomColumnsData } from './useCustomColumnsData';

describe('useCustomColumnsData', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('retrieves and merges custom data reactively', async () => {
        const records = ref([{ id: 'first' }]);
        const enabled = ref(true);
        const retrieve = vi.fn().mockResolvedValue([{ id: 'first', custom: 'value' }]);
        const mergeCustomData = vi.fn(({ records, retrievedData }: { records: { id: string }[]; retrievedData: CustomDataRetrieved[] }) =>
            records.map((record, index) => ({ ...record, ...(retrievedData[index] ?? {}) }))
        );
        const scope = effectScope();
        const result = scope.run(() =>
            useCustomColumnsData({
                records: () => records.value,
                hasCustomColumn: () => enabled.value,
                onDataRetrieve: () => retrieve,
                mergeCustomData,
            })
        )!;

        await vi.waitFor(() => expect(result.loadingCustomRecords.value).toBe(false));
        expect(retrieve).toHaveBeenCalledWith([{ id: 'first' }]);
        expect(result.customRecords.value).toEqual([{ id: 'first', custom: 'value' }]);

        enabled.value = false;
        records.value = [{ id: 'second' }];
        await nextTick();

        expect(result.customRecords.value).toEqual([{ id: 'second' }]);
        scope.stop();
    });

    test('ignores stale custom-data results', async () => {
        const firstRequest = createDeferred<{ id: string; custom: string }[]>();
        const secondRequest = createDeferred<{ id: string; custom: string }[]>();
        const records = ref([{ id: 'first' }]);
        const retrieve = vi.fn().mockReturnValueOnce(firstRequest.promise).mockReturnValueOnce(secondRequest.promise);
        const scope = effectScope();
        const result = scope.run(() =>
            useCustomColumnsData({
                records: () => records.value,
                hasCustomColumn: () => true,
                onDataRetrieve: () => retrieve,
                mergeCustomData: ({ records, retrievedData }) => records.map((record, index) => ({ ...record, ...(retrievedData[index] ?? {}) })),
            })
        )!;

        await vi.waitFor(() => expect(retrieve).toHaveBeenCalledOnce());
        records.value = [{ id: 'second' }];
        await vi.waitFor(() => expect(retrieve).toHaveBeenCalledTimes(2));

        secondRequest.resolve([{ id: 'second', custom: 'current' }]);
        await vi.waitFor(() => expect(result.customRecords.value).toEqual([{ id: 'second', custom: 'current' }]));

        firstRequest.resolve([{ id: 'first', custom: 'stale' }]);
        await firstRequest.promise;
        expect(result.customRecords.value).toEqual([{ id: 'second', custom: 'current' }]);
        scope.stop();
    });

    test('falls back to source records for failed or malformed custom data', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const records = ref([{ id: 'first' }]);
        const retrieve = ref(vi.fn().mockResolvedValue({ malformed: true }));
        const scope = effectScope();
        const result = scope.run(() =>
            useCustomColumnsData({
                records: () => records.value,
                hasCustomColumn: () => true,
                onDataRetrieve: () => retrieve.value,
                mergeCustomData: ({ records, retrievedData }) => records.map((record, index) => ({ ...record, ...(retrievedData[index] ?? {}) })),
            })
        )!;

        await vi.waitFor(() => expect(result.loadingCustomRecords.value).toBe(false));
        expect(result.customRecords.value).toEqual([{ id: 'first' }]);
        expect(consoleError).toHaveBeenCalledOnce();

        retrieve.value = vi.fn().mockRejectedValue(new Error('Retrieval failed'));
        await vi.waitFor(() => expect(consoleError).toHaveBeenCalledTimes(2));
        expect(result.customRecords.value).toEqual([{ id: 'first' }]);
        scope.stop();
    });
});

import { useCallback, useEffect, useState } from 'preact/hooks';
import { OnDataRetrievedCallback } from '../components/types';
import { isFunction } from '../utils';

export const useCustomColumnsData = <T>({
    records,
    hasCustomColumn = false,
    onDataRetrieved,
    mergeCustomData,
}: {
    records: T[];
    hasCustomColumn?: boolean;
    onDataRetrieved: OnDataRetrievedCallback<T> | undefined;
    mergeCustomData: (args: { retrievedData: Awaited<ReturnType<OnDataRetrievedCallback<T>>>; records: T[] }) => (T & Record<string, any>)[];
}) => {
    const [customRecords, setCustomRecords] = useState<T[] | (T & Record<string, any>)[]>(records);
    const [loadingCustomRecords, setLoadingCustomRecords] = useState(false);

    const mergedRecords = useCallback(async () => {
        try {
            if (hasCustomColumn && isFunction(onDataRetrieved)) {
                const retrievedData = await onDataRetrieved(records);
                setCustomRecords(mergeCustomData({ records, retrievedData: retrievedData?.filter(Boolean) || [] }));
            }
        } catch (error) {
            setCustomRecords(records);
            console.error(error);
        } finally {
            setLoadingCustomRecords(false);
        }
    }, [hasCustomColumn, onDataRetrieved, mergeCustomData, records]);

    useEffect(() => {
        if (records.length) {
            setLoadingCustomRecords(true);
            void mergedRecords();
        }
    }, [mergedRecords, records]);

    return { customRecords, loadingCustomRecords } as const;
};

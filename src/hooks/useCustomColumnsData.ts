import { useCallback, useEffect, useState } from 'preact/hooks';
import { OnDataRetrievedCallback } from '../components/types';
import { isFunction } from '../utils';

export const useCustomColumnsData = <T>({
    records,
    hasCustomColumn = false,
    onDataRetrieve,
    mergeCustomData,
}: {
    records: T[];
    hasCustomColumn?: boolean;
    onDataRetrieve?: OnDataRetrievedCallback<T[]> | undefined;
    mergeCustomData: (args: { retrievedData: Awaited<ReturnType<OnDataRetrievedCallback<T[]>>>; records: T[] }) => (T & Record<string, any>)[];
}) => {
    const [customRecords, setCustomRecords] = useState<T[] | (T & Record<string, any>)[]>(records);
    const [loadingCustomRecords, setLoadingCustomRecords] = useState(false);

    const mergedRecords = useCallback(async () => {
        try {
            if (hasCustomColumn && isFunction(onDataRetrieve)) {
                const retrievedData = await onDataRetrieve(records);
                if (!Array.isArray(retrievedData)) throw new Error('Retrieved data should be an array');
                else setCustomRecords(mergeCustomData({ records, retrievedData: retrievedData?.filter(Boolean) || [] }));
            } else {
                setCustomRecords(records);
            }
        } catch (error) {
            setCustomRecords(records);
            console.error(error);
        } finally {
            setLoadingCustomRecords(false);
        }
    }, [hasCustomColumn, onDataRetrieve, mergeCustomData, records]);

    useEffect(() => {
        if (hasCustomColumn && onDataRetrieve) {
            setLoadingCustomRecords(true);
        }
        void mergedRecords();
    }, [hasCustomColumn, mergedRecords, onDataRetrieve]);

    return { customRecords, loadingCustomRecords } as const;
};

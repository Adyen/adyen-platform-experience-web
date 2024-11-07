import { useCallback, useEffect, useState } from 'preact/hooks';
import { OnDataRetrievedCallback } from '../components/types';

export const useCustomColumnsData = <T>({
    records,
    onDataRetrieved,
    mergeCustomData,
}: {
    records: T[];
    onDataRetrieved: OnDataRetrievedCallback<T> | undefined;
    mergeCustomData: (args: { retrievedData: Awaited<ReturnType<OnDataRetrievedCallback<T>>>; records: T[] }) => (T & Record<string, any>)[];
}) => {
    const [customRecords, setCustomRecords] = useState<T[] | (T & Record<string, any>)[]>(records);
    const [loadingCustomRecords, setLoadingCustomRecords] = useState(false);

    const mergedRecords = useCallback(
        (data: T[]) => async () => {
            try {
                const retrievedData = onDataRetrieved ? await onDataRetrieved(data) : [];

                setCustomRecords(mergeCustomData({ records, retrievedData }));
            } catch (error) {
                setCustomRecords(records);
                console.error(error);
            } finally {
                setLoadingCustomRecords(false);
            }
        },
        [onDataRetrieved, records, mergeCustomData]
    );

    useEffect(() => {
        if (onDataRetrieved && records.length) {
            setLoadingCustomRecords(true);
            mergedRecords(records)();
        }
    }, [onDataRetrieved, mergedRecords, records]);

    return { customRecords, loadingCustomRecords } as const;
};

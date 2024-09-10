import { useCallback, useEffect, useState } from 'preact/hooks';

export const useCustomColumnsData = <T>({
    records,
    onDataRetrieved,
    setCustomData,
}: {
    records: T[];
    onDataRetrieved: ((arg: T[]) => Promise<(T & Record<string, any>)[]>) | undefined;
    setCustomData: (args: { retrievedData: (T & Record<string, any>)[]; records: T[] }) => (T & Record<string, any>)[];
}) => {
    const [customRecords, setCustomRecords] = useState<T[] | (T & Record<string, any>)[]>(records);
    const [loadingCustomRecords, setLoadingCustomRecords] = useState(false);

    const mergedRecords = useCallback(
        (data: T[]) => async () => {
            try {
                const retrievedData = onDataRetrieved ? await onDataRetrieved(data) : [];
                setCustomRecords(setCustomData({ records, retrievedData }));
            } catch (error) {
                setCustomRecords(records);
                console.error(error);
            } finally {
                setLoadingCustomRecords(false);
            }
        },
        [onDataRetrieved, records, setCustomData]
    );

    useEffect(() => {
        if (onDataRetrieved && records.length) {
            setLoadingCustomRecords(true);
            mergedRecords(records)();
        }
    }, [onDataRetrieved, mergedRecords, records]);

    return { customRecords: customRecords as T[], loadingCustomRecords } as const;
};

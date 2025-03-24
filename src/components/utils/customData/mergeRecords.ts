import { EMPTY_OBJECT } from '../../../utils';

export type MatchRecordCallback<OriginalRecord extends Record<string, any>, ModifiedRecord extends Record<string, any>> = (
    modifiedRecord: ModifiedRecord,
    originalRecord: OriginalRecord,
    recordIndex: number
) => any;

export type MergedRecord<OriginalRecord extends Record<string, any>, ModifiedRecord extends Record<string, any>> =
    | OriginalRecord
    | (OriginalRecord & Partial<Omit<ModifiedRecord, keyof OriginalRecord>>);

export const mergeRecords = <OriginalRecord extends Record<string, any>, ModifiedRecord extends Record<string, any>>(
    originalRecords: OriginalRecord[],
    modifiedRecords: ModifiedRecord[],
    matchRecordCallback: MatchRecordCallback<OriginalRecord, ModifiedRecord>
) => {
    const mergedRecords: MergedRecord<OriginalRecord, ModifiedRecord>[] = [];

    for (let i = 0; i < originalRecords.length; i++) {
        const originalRecord = originalRecords[i]!;
        const modifiedRecord = modifiedRecords.find(record => matchRecordCallback(record, originalRecord, i));
        mergedRecords[i] = { ...(modifiedRecord ?? EMPTY_OBJECT), ...originalRecord };
    }

    return mergedRecords;
};

export default mergeRecords;

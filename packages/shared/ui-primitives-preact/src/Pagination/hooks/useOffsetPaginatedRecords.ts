import { PaginatedRecordsInitOptions, UsePaginatedRecords } from './types';
import { PaginationType } from '../types';
import usePaginatedRecords from './usePaginatedRecords';

const useOffsetPaginatedRecords = <T, DataField extends string, FilterValue extends string, FilterParam extends string>(
    initOptions: PaginatedRecordsInitOptions<T, DataField, FilterValue, FilterParam>
): UsePaginatedRecords<T, FilterValue, FilterParam> => {
    return usePaginatedRecords<T, DataField, FilterValue, FilterParam>({
        ...initOptions,
        pagination: PaginationType.OFFSET,
    });
};

export default useOffsetPaginatedRecords;

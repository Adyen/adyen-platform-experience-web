import { PaginatedRecordsInitOptions, UsePaginatedRecords } from './types';
import { PaginatedResponseDataField, PaginationType } from '../types';
import usePaginatedRecords from './usePaginatedRecords';

const useOffsetPaginatedRecords = <T, DataField extends PaginatedResponseDataField, FilterValue extends string, FilterParam extends string>(
    initOptions: PaginatedRecordsInitOptions<T, DataField, FilterValue, FilterParam>
): UsePaginatedRecords<T, FilterValue, FilterParam> => {
    return usePaginatedRecords<T, DataField, FilterValue, FilterParam>({
        ...initOptions,
        pagination: PaginationType.OFFSET
    });
};

export default useOffsetPaginatedRecords;

import { PaginatedRecordsInitOptions, UsePaginatedRecords } from './types';
import usePaginatedRecords from './usePaginatedRecords';
import { PaginationType } from '../types';

const useCursorPaginatedRecords = <T, DataField extends string, FilterValue extends string, FilterParam extends string>(
    initOptions: PaginatedRecordsInitOptions<T, DataField, FilterValue, FilterParam>
): UsePaginatedRecords<T, FilterValue, FilterParam> => {
    return usePaginatedRecords<T, DataField, FilterValue, FilterParam>({
        ...initOptions,
        pagination: PaginationType.CURSOR,
    });
};

export default useCursorPaginatedRecords;

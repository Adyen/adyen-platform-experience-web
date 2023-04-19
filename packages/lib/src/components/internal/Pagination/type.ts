import { PageNeighbours } from '../../../hooks/usePaginatedRecords';

export interface PaginationProps {
    page: number;
    hasNextPage: boolean;
    onChange: (dir: PageNeighbours) => void;
}
export enum PageChangeOptions {
    NEXT = 'next',
    PREV = 'prev',
}

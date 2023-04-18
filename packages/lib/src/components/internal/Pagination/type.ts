import { PageNeighbours } from '../../../hooks/usePartialRecordSet';

export interface PaginationProps {
    page: number;
    hasNextPage: boolean;
    onChange: (dir: PageNeighbours) => void;
}
export enum PageChangeOptions {
    NEXT = 'next',
    PREV = 'prev',
}

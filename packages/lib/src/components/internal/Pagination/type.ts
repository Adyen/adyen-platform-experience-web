export interface PaginationProps {
    page: number;
    hasNextPage: boolean;
    changePage?: (page: number) => void;
    onChange: (dir: PageChangeOptions) => void;
}
export enum PageChangeOptions {
    NEXT = 'next',
    PREV = 'prev',
}

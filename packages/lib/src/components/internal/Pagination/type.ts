export interface PaginationProps {
    page: number;
    hasNextPage: boolean;
    changePage: (dir: PageChangeOptions) => void;
    onChange: (dir: PageChangeOptions) => void;
}
export enum PageChangeOptions {
    NEXT = 'next',
    PREV = 'prev',
}

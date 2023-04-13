export interface PaginationProps {
    page: number;
    hasNextPage: boolean;
    onChange: (dir: PageChangeOptions) => void;
}
export enum PageChangeOptions {
    NEXT = 'next',
    PREV = 'prev',
}

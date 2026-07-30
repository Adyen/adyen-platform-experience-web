export type DataGridCustomColumnConfig<k> = {
    key: k;
    flex?: number;
    align?: 'right' | 'left' | 'center';
    visibility?: 'visible' | 'hidden';
};

export type CustomColumn<T extends string> = {
    [k in T]: DataGridCustomColumnConfig<k>;
}[T];

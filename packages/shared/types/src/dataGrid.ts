export type DataGridCustomColumnConfig<k> = {
    key: k;
    flex?: number;
    visibility?: 'visible' | 'hidden';
};

export type CustomColumn<T extends string> = {
    [k in T]: DataGridCustomColumnConfig<k>;
}[T];

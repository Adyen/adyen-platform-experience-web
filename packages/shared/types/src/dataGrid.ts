export type DataGridCustomColumnConfig<K> = {
    key: K;
    flex?: number;
    visibility?: 'visible' | 'hidden';
};

export type CustomColumn<T extends string> = {
    [K in T]: DataGridCustomColumnConfig<K>;
}[T];

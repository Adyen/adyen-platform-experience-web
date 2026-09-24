export type DataGridCustomColumnConfig<K> = {
    key: K;
    flex?: number;
    align?: 'right' | 'left' | 'center';
    visibility?: 'visible' | 'hidden';
};

export type CustomColumn<T extends string> = {
    [K in T]: DataGridCustomColumnConfig<K>;
}[T];

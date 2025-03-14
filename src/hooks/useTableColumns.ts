import { useMemo } from 'preact/hooks';
import { getLabel } from '../components/utils/getLabel';
import { CellTextPosition } from '../components/internal/DataGrid/types';
import { CustomColumn, DataGridCustomColumnConfig } from '../components/types';
import useCoreContext from '../core/Context/useCoreContext';
import { EMPTY_OBJECT, isUndefined } from '../utils';

type Columns<k extends string> = DataGridCustomColumnConfig<k> & { label?: string; position?: CellTextPosition; visible?: boolean };

function removeUndefinedProperties<T extends string>(obj: Omit<Columns<T>, 'key'>): Partial<Columns<T>> {
    let result: Partial<Omit<Columns<T>, 'key'>> = {};
    for (const key of Object.keys(obj) as Array<keyof Omit<Columns<T>, 'key'>>) {
        if (!isUndefined(obj[key])) {
            result = { ...result, [key as keyof T]: obj[key] };
        }
    }
    return result;
}

export const useTableColumns = <T extends string, C extends string>({
    fields,
    customColumns,
    columnConfig,
}: {
    fields: T[] | Readonly<T[]>;
    customColumns?: CustomColumn<C>[];
    columnConfig?: { [k in T]?: Omit<Columns<k>, 'key'> };
}) => {
    const { i18n } = useCoreContext();

    const tableColumns: CustomColumn<T>[] = useMemo(() => fields.map(field => ({ key: field })), [fields]);

    const columns = useMemo(() => {
        const mergedColumns = [...tableColumns, ...(customColumns || [])];

        const customColumnsMap =
            customColumns?.reduce<Record<string, (typeof customColumns)[number]>>((acc, col) => {
                acc[col.key] = col;
                return acc;
            }, {}) || {};

        // Use a Map to track columns by key.
        const columnMap = new Map<string, { key: T; position?: 'center' | 'left' | 'right'; flex?: number; visible?: boolean; label: string }>();

        mergedColumns.forEach(current => {
            // Check if there is a custom column that should be hidden
            const hiddenColumn = customColumnsMap[current.key];
            if (hiddenColumn?.visible === false) return;

            if (columnMap.has(current.key)) {
                // Merge properties from current into the existing column.
                const existing = columnMap.get(current.key)!;
                // Current's properties will override existing ones if there are conflicts
                columnMap.set(current.key, { ...existing, ...current });
            } else {
                const { key, flex, align } = current;
                const label = i18n.get(getLabel(key as any));
                const config = removeUndefinedProperties<T>(columnConfig?.[key] || EMPTY_OBJECT);

                columnMap.set(current.key, { key: key as unknown as T, label, visible: true, flex, position: align, ...config });
            }
        });

        return Array.from(columnMap.values());
    }, [columnConfig, customColumns, i18n, tableColumns]);

    return columns;
};

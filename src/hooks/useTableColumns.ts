import { useMemo } from 'preact/hooks';
import { CellTextPosition } from '../components/internal/DataGrid/types';
import { CustomColumn, DataGridCustomColumnConfig } from '../components/types';
import useCoreContext from '../core/Context/useCoreContext';
import { EMPTY_OBJECT, isUndefined } from '../utils';
import { containerQueries, useResponsiveContainer } from './useResponsiveContainer';
import { TranslationKey } from '../translations';

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
    fieldsKeys,
}: {
    fields: T[] | Readonly<T[]>;
    customColumns?: CustomColumn<C>[];
    columnConfig?: { [k in T]?: Omit<Columns<k>, 'key'> };
    fieldsKeys?: { [k in T]?: TranslationKey };
}) => {
    const { i18n } = useCoreContext();

    const tableColumns: CustomColumn<T>[] = useMemo(() => fields.map(field => ({ key: field })), [fields]);
    const isSmAndUpContainer = useResponsiveContainer(containerQueries.up.sm);

    const columns = useMemo(() => {
        const newFields = customColumns?.filter(cc => !fields?.some(field => field === (cc.key as unknown as T))).map(colum => colum.key) || [];

        const mergedColumns = [...tableColumns, ...(customColumns?.filter(col => col?.key) || [])];

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
            if (hiddenColumn?.visibility === 'hidden') return;

            if (columnMap.has(current.key)) {
                // Merge properties from current into the existing column.
                const existing = columnMap.get(current.key)!;
                // Current's properties will override existing ones if there are conflicts
                columnMap.set(current.key, {
                    ...existing,
                    ...current,
                    visible: current.visibility !== 'hidden',
                    position: current.align || existing.position,
                });
            } else {
                const { key, flex, align } = current;
                const label = i18n.get(fieldsKeys?.[key] || (key as any));
                const config = removeUndefinedProperties<T>(columnConfig?.[key] || EMPTY_OBJECT);

                columnMap.set(current.key, {
                    key: key as unknown as T,
                    label,
                    visible: newFields.includes(current.key as unknown as C) ? isSmAndUpContainer : true,
                    flex,
                    position: align,
                    ...config,
                });
            }
        });

        return Array.from(columnMap.values());
    }, [columnConfig, customColumns, fields, i18n, isSmAndUpContainer, tableColumns]);

    return columns;
};

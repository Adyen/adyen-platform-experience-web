import { useMemo } from 'preact/hooks';
import { getLabel } from '../utils/getLabel';
import { CellTextPosition } from '../internal/DataGrid/types';
import { CustomColumn } from '../types';
import useCoreContext from '../../core/Context/useCoreContext';

type Columns<k> = { key: k; label?: string; position?: CellTextPosition; flex?: number; visible?: boolean };

function removeUndefinedProperties<T>(obj: Omit<Columns<T>, 'key'>): Partial<Columns<T>> {
    let result: Partial<Omit<Columns<T>, 'key'>> = {};
    for (const key of Object.keys(obj) as Array<keyof Omit<Columns<T>, 'key'>>) {
        if (obj[key] !== undefined) {
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

    const tableColumns: CustomColumn<T>[] = fields.map(field => ({ key: field }));

    const columns = useMemo(() => {
        return (customColumns || tableColumns).map(({ key, flex }) => {
            const label = i18n.get(getLabel(key as any));

            const config = removeUndefinedProperties<T>(columnConfig?.[key] || {});

            return { key: key as T, label, visible: true, flex, ...(config || {}) };
        });
    }, [columnConfig, customColumns, i18n, tableColumns]);

    return columns;
};

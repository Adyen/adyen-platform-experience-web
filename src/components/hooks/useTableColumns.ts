import { useMemo } from 'preact/hooks';
import { getLabel } from '../utils/getLabel';
import { CellTextPosition } from '../internal/DataGrid/types';
import { CustomColumn, DataGridCustomColumnConfig } from '../types';
import useCoreContext from '../../core/Context/useCoreContext';
import { EMPTY_OBJECT, isString, isUndefined } from '../../utils';

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

function _isStringArray(columns: any): columns is string[] {
    return columns.every(isString);
}

export const useTableColumns = <T extends string, C extends string>({
    fields,
    customColumns,
    columnConfig,
}: {
    fields: T[] | Readonly<T[]>;
    customColumns?: CustomColumn<C>[] | C[];
    columnConfig?: { [k in T]?: Omit<Columns<k>, 'key'> };
}) => {
    const { i18n } = useCoreContext();

    const tableColumns: CustomColumn<T>[] = useMemo(() => fields.map(field => ({ key: field })), [fields]);

    const columns = useMemo(() => {
        const parsedCols = customColumns
            ? _isStringArray(customColumns)
                ? customColumns.map<CustomColumn<C>>(col => ({ key: col }))
                : customColumns
            : undefined;

        return (parsedCols || tableColumns).map(({ key, flex, icon }) => {
            const label = i18n.get(getLabel(key as any));

            const config = removeUndefinedProperties<T>(columnConfig?.[key] || EMPTY_OBJECT);

            return { key: key as unknown as T, label, visible: true, flex, icon, ...(config || EMPTY_OBJECT) };
        });
    }, [columnConfig, customColumns, i18n, tableColumns]);

    return columns;
};

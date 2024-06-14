import { DataGridContext } from '../hooks/useDataGridContext';
import { ComponentChildren, toChildArray } from 'preact';
import { useCallback, useMemo } from 'preact/hooks';

type ColumnWidth = { column: string; width: number };

export const DataGridProvider = ({ children }: { children: ComponentChildren }) => {
    const minWidthByColum = useMemo(() => new Map<string, number>(), []);
    const registerCells: (props: ColumnWidth) => void = ({ column, width }) => {
        if (minWidthByColum.has(column)) {
            const existingWidth = minWidthByColum.get(column)!;
            if (width > existingWidth) {
                minWidthByColum.set(column, width);
            }
        } else {
            minWidthByColum.set(column, width);
        }
    };

    const getMinWidthByColum = useCallback(
        (column: string) => {
            return minWidthByColum.get(column);
        },
        [minWidthByColum]
    );

    return <DataGridContext.Provider value={{ registerCells, getMinWidthByColum }}>{toChildArray(children)}</DataGridContext.Provider>;
};

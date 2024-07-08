import { DataGridContext } from '../hooks/useDataGridContext';
import { ComponentChildren, toChildArray } from 'preact';
import { useCallback, useMemo } from 'preact/hooks';

type ColumnWidth = { column: string; width: number };

export const DataGridProvider = ({ children }: { children: ComponentChildren }) => {
    const minWidthByColumn = useMemo(() => new Map<string, number>(), []);
    const registerCells: (props: ColumnWidth) => void = useCallback(
        ({ column, width }) => {
            if (minWidthByColumn.has(column)) {
                const existingWidth = minWidthByColumn.get(column)!;
                if (width > existingWidth) {
                    minWidthByColumn.set(column, width);
                }
            } else {
                minWidthByColumn.set(column, width);
            }
        },
        [minWidthByColumn]
    );

    const getMinWidthByColumn = useCallback(
        (column: string) => {
            return minWidthByColumn.get(column);
        },
        [minWidthByColumn]
    );

    return <DataGridContext.Provider value={{ registerCells, getMinWidthByColumn }}>{toChildArray(children)}</DataGridContext.Provider>;
};

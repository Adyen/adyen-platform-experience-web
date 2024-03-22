import DataGridCell from '@src/components/internal/DataGrid/DataGridCell';
import { DataGridColumn } from '@src/components/internal/DataGrid/types';
import { CustomCell } from '@src/components/internal/DataGrid/DataGrid';

export const TableCells = <
    Items extends Array<any>,
    Columns extends Array<DataGridColumn<Extract<keyof Items[number], string>>>,
    CustomCells extends CustomCell<Items, Columns, Columns[number]>
>({
    columns,
    customCells,
    item,
    rowIndex,
}: {
    columns: Columns;
    customCells?: CustomCells;
    item: Items[number];
    rowIndex: number;
}) => {
    return (
        <>
            {columns.map(({ key }) => {
                if (customCells?.[key])
                    return (
                        <DataGridCell aria-labelledby={String(key)} key={key}>
                            {
                                // TODO create safeguard to remove "as any" assertion
                                customCells[key]!({
                                    key,
                                    value: item[key],
                                    item,
                                    rowIndex,
                                } as any)
                            }
                        </DataGridCell>
                    );

                return (
                    <DataGridCell aria-labelledby={String(key)} key={key}>
                        {item[key]}
                    </DataGridCell>
                );
            })}
        </>
    );
};

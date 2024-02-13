import { TableCells } from './TableCells';
import { DataGridColumn, InteractiveBodyProps } from '../types';
import { CustomCell } from '../../DataGrid/DataGrid';

export const TableBody = <
    Items extends Array<any>,
    Columns extends Array<DataGridColumn<Extract<keyof Items[number], string>>>,
    ClickedField extends keyof Items[number],
    CustomCells extends CustomCell<Items, Columns, Columns[number]>
>({
    data,
    columns,
    customCells,
}: Omit<InteractiveBodyProps<Items, Columns, ClickedField, CustomCells>, 'onRowClick'>) => {
    return (
        <>
            {data?.map(item => (
                <tr className="adyen-fp-data-grid__row" key={item}>
                    <TableCells<Items, Columns, CustomCells> columns={columns} customCells={customCells} item={item} />
                </tr>
            ))}
        </>
    );
};

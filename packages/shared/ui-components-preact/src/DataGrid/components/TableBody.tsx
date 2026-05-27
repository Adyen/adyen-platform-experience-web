import { TableCells } from './TableCells';
import { DataGridColumn, InteractiveBodyProps } from '../types';
import { CustomCell } from '../DataGrid';

export const TableBody = <
    Items extends Array<any>,
    Columns extends Array<DataGridColumn<Extract<keyof Items[number], string>>>,
    ClickedField extends keyof Items[number],
    CustomCells extends CustomCell<Items, Columns, Columns[number]>,
>({
    data,
    columns,
    customCells,
    onRowHover,
}: Omit<InteractiveBodyProps<Items, Columns, ClickedField, CustomCells>, 'onRowClick'>) => (
    <>
        {data?.map((item, index) => {
            const onHoverEnter = onRowHover && onRowHover.bind(null, index);
            const onHoverLeave = onRowHover && onRowHover.bind(null, undefined);
            return (
                <div
                    role="row"
                    tabIndex={0}
                    className="adyen-pe-data-grid__row"
                    key={item}
                    onMouseEnter={onHoverEnter}
                    onFocus={onHoverEnter}
                    onMouseLeave={onHoverLeave}
                    onBlur={onHoverLeave}
                >
                    <TableCells<Items, Columns, CustomCells> columns={columns} customCells={customCells} item={item} rowIndex={index} />
                </div>
            );
        })}
    </>
);

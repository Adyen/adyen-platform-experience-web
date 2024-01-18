import { TableCells } from '@src/components/internal/DataGrid/components/TableCells';
import { InteractiveBodyProps } from '../types';

export const TableBody = <Items extends any[], ClickedField extends keyof Items[number]>({
    data,
    columns,
    customCells,
}: Omit<InteractiveBodyProps<Items, ClickedField>, 'onRowClick'>) => {
    return (
        <>
            {data.map(item => (
                <tr className="adyen-fp-data-grid__row" key={item}>
                    <TableCells columns={columns} customCells={customCells} item={item} />
                </tr>
            ))}
        </>
    );
};

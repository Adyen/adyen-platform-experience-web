import useCoreContext from '../../../../core/Context/useCoreContext';
import { noop } from '../../../../utils';
import { TableCells } from './TableCells';
import { DataGridColumn, InteractiveBodyProps } from '../types';
import { CustomCell } from '../DataGrid';

export const TableBody = <
    Items extends Array<any>,
    Columns extends Array<DataGridColumn<Extract<keyof Items[number], string>>>,
    ClickedField extends keyof Items[number],
    Fields extends Readonly<Array<string>>,
    CustomCells extends CustomCell<Items, Columns, Columns[number], Fields>
>({
    data,
    columns,
    customCells,
    onRowHover,
}: Omit<InteractiveBodyProps<Items, Columns, ClickedField, Fields, CustomCells>, 'onRowClick'>) => {
    const { i18n } = useCoreContext();
    return (
        <>
            {data?.map((item, index) => (
                <div
                    role="row"
                    tabIndex={0}
                    className="adyen-pe-data-grid__row"
                    key={item}
                    onMouseEnter={i18n.has(`tooltip.${item?.category}`) && onRowHover ? () => onRowHover(index) : noop}
                    onFocus={i18n.has(`tooltip.${item?.category}`) && onRowHover ? () => onRowHover(index) : noop}
                    onMouseLeave={i18n.has(`tooltip.${item?.category}`) && onRowHover ? () => onRowHover() : noop}
                    onBlur={i18n.has(`tooltip.${item?.category}`) && onRowHover ? () => onRowHover() : noop}
                >
                    <TableCells<Items, Columns, Fields, CustomCells> columns={columns} customCells={customCells} item={item} rowIndex={index} />
                </div>
            ))}
        </>
    );
};

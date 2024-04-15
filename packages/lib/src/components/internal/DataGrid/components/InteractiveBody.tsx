import { TableCells } from '@src/components/internal/DataGrid/components/TableCells';
import useCoreContext from '@src/core/Context/useCoreContext';
import { noop } from '@src/utils/common';
import { useCallback } from 'preact/hooks';
import { useInteractiveDataGrid } from '@src/components/internal/DataGrid/hooks/useInteractiveDataGrid';
import { DataGridColumn, InteractiveBodyProps } from '../types';
import { CustomCell } from '../../DataGrid/DataGrid';

export const InteractiveBody = <
    Items extends any[],
    Columns extends Array<DataGridColumn<Extract<keyof Items[number], string>>>,
    ClickedField extends keyof Items[number],
    CustomCells extends CustomCell<Items, Columns, Columns[number]>
>({
    data,
    columns,
    onRowClick,
    customCells,
    onRowHover,
}: InteractiveBodyProps<Items, Columns, ClickedField, CustomCells>) => {
    const onClickCallBack = useCallback(
        (item: Items[number]) => () => onRowClick?.callback(onRowClick?.retrievedField ? item[onRowClick.retrievedField] : item),
        [onRowClick]
    );

    const { i18n } = useCoreContext();

    const { currentIndex, listeners, ref } = useInteractiveDataGrid({ totalRows: data?.length ?? 0 });

    return (
        <>
            {data?.map((item, index) => (
                <tr
                    onMouseEnter={i18n.has(`tooltip.${item?.category}`) && onRowHover ? () => onRowHover(index) : noop}
                    onFocus={i18n.has(`tooltip.${item?.category}`) && onRowHover ? () => onRowHover(index) : noop}
                    onMouseLeave={i18n.has(`tooltip.${item?.category}`) && onRowHover ? () => onRowHover() : noop}
                    onBlur={i18n.has(`tooltip.${item?.category}`) && onRowHover ? () => onRowHover() : noop}
                    ref={ref}
                    aria-selected={index === currentIndex}
                    data-index={index}
                    className="adyen-pe-data-grid__row adyen-pe-data-grid__row--clickable"
                    key={item}
                    onClick={onClickCallBack(item)}
                    onFocusCapture={listeners.onFocusCapture(index)}
                    onKeyDownCapture={listeners.onKeyDownCapture}
                >
                    <TableCells columns={columns} customCells={customCells} item={item} rowIndex={index} />
                </tr>
            ))}
        </>
    );
};

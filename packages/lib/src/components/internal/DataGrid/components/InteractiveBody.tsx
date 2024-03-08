import { TableCells } from '@src/components/internal/DataGrid/components/TableCells';
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
}: InteractiveBodyProps<Items, Columns, ClickedField, CustomCells>) => {
    const onClickCallBack = useCallback(
        (item: Items[number]) => () => onRowClick?.callback(onRowClick?.retrievedField ? item[onRowClick.retrievedField] : item),
        [onRowClick]
    );

    const { currentIndex, listeners, ref } = useInteractiveDataGrid({ totalRows: data?.length ?? 0 });

    return (
        <>
            {data?.map((item, index) => (
                <tr
                    ref={ref}
                    aria-selected={index === currentIndex}
                    data-index={index}
                    className="adyen-fp-data-grid__row adyen-fp-data-grid__row--clickable"
                    key={item}
                    onClick={onClickCallBack(item)}
                    onFocusCapture={listeners.onFocusCapture(index)}
                    onKeyDownCapture={listeners.onKeyDownCapture}
                >
                    <TableCells columns={columns} customCells={customCells} item={item} />
                </tr>
            ))}
        </>
    );
};

import { TableCells } from './TableCells';
import { useCallback } from 'preact/hooks';
import { useInteractiveDataGrid } from '../hooks/useInteractiveDataGrid';
import { DataGridColumn, InteractiveBodyProps } from '../types';
import { CustomCell } from '../DataGrid';

export const InteractiveBody = <
    Items extends any[],
    Columns extends Array<DataGridColumn<Extract<keyof Items[number], string>>>,
    ClickedField extends keyof Items[number],
    CustomCells extends CustomCell<Items, Columns, Columns[number]>,
>({
    data,
    columns,
    onRowClick,
    customCells,
    onRowHover,
}: InteractiveBodyProps<Items, Columns, ClickedField, CustomCells>) => {
    const { currentIndex, listeners, ref } = useInteractiveDataGrid({ totalRows: data?.length ?? 0 });

    const onClickCallBack = useCallback(
        (item: Items[number]) => () => onRowClick?.callback(onRowClick?.retrievedField ? item[onRowClick.retrievedField] : item),
        [onRowClick]
    );

    return (
        <>
            {data?.map((item, index) => {
                const onHoverEnter = onRowHover && onRowHover.bind(null, index);
                const onHoverLeave = onRowHover && onRowHover.bind(null, undefined);
                return (
                    <div
                        role="row"
                        tabIndex={0}
                        onMouseEnter={onHoverEnter}
                        onFocus={onHoverEnter}
                        onMouseLeave={onHoverLeave}
                        onBlur={onHoverLeave}
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
                    </div>
                );
            })}
        </>
    );
};

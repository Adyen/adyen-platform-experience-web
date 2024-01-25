import { TableCells } from '@src/components/internal/DataGrid/components/TableCells';
import { useCallback } from 'preact/hooks';
import { useInteractiveDataGrid } from '@src/components/internal/DataGrid/hooks/useInteractiveDataGrid';
import { InteractiveBodyProps } from '../types';

export const InteractiveBody = <Items extends any[], ClickedField extends keyof Items[number]>({
    data,
    columns,
    onRowClick,
    customCells,
}: InteractiveBodyProps<Items, ClickedField>) => {
    const onClickCallBack = useCallback((item: Items[number]) => () => onRowClick?.callback(item[onRowClick.retrievedField]), [onRowClick]);

    const { currentIndex, listeners, ref } = useInteractiveDataGrid({ totalRows: data.length });

    return (
        <>
            {data.map((item, index) => (
                <tr
                    ref={ref}
                    aria-selected={index === currentIndex}
                    data-index={index}
                    className="adyen-fp-data-grid--clickable-row"
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

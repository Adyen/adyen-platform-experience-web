import DataGridCell from '../DataGridCell';
import { DataGridColumn } from '../types';
import { CustomCell } from '../DataGrid';
import Icon from './Icon';
import { CustomDataObject } from '../../../types';

export const _isCustomDataObject = (item: any): item is CustomDataObject => {
    return !!item && typeof item === 'object' && 'value' in item;
};

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
            {columns.map(({ key, position }) => {
                if (customCells?.[key])
                    return (
                        <DataGridCell aria-labelledby={String(key)} key={key} column={key} position={position}>
                            <div style={{ width: 'min-content' }}>
                                {
                                    // TODO create safeguard to remove "as any" assertion
                                    customCells[key]!({
                                        key,
                                        value: item[key],
                                        item,
                                        rowIndex,
                                    } as any)
                                }
                            </div>
                        </DataGridCell>
                    );

                // TODO: remove typecast as CustomDataObject
                const { icon, value } = _isCustomDataObject(item[key]) ? (item[key] as CustomDataObject) : { value: item[key], icon: undefined };

                return (
                    <DataGridCell aria-labelledby={String(key)} key={key} column={key} position={position}>
                        <div className="adyen-pe-data-grid__cell-value">
                            {icon?.url && <Icon {...icon} />}
                            <div>{value}</div>
                        </div>
                    </DataGridCell>
                );
            })}
        </>
    );
};

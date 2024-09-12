import DataGridCell from '../DataGridCell';
import { DataGridColumn } from '../types';
import { CustomCell } from '../DataGrid';
import Icon from './Icon';
import { isFunction } from '../../../../utils';

const _iconIsFunction = (icon: any): icon is (value: unknown) => { url: string } => {
    if (!isFunction(icon)) return false;
    const iconResult = icon('test');
    return !!iconResult && typeof iconResult === 'object' && 'url' in iconResult;
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
            {columns.map(({ key, position, icon }) => {
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
                const iconObject = _iconIsFunction(icon) ? icon(item[key]) : icon;
                return (
                    <DataGridCell aria-labelledby={String(key)} key={key} column={key} position={position}>
                        <div className="adyen-pe-data-grid__cell-value">
                            {iconObject?.url && <Icon {...icon} url={iconObject?.url} />}
                            <div>{item[key]}</div>
                        </div>
                    </DataGridCell>
                );
            })}
        </>
    );
};

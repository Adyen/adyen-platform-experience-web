import DataGridCell from '../DataGridCell';
import { DataGridColumn } from '../types';
import { CustomCell } from '../DataGrid';
import Icon from './Icon';
import { CustomButtonObject, CustomDataObject, CustomIconObject, CustomLinkObject } from '../../../types';
import Button from '../../Button';
import { JSXInternal } from 'preact/src/jsx';
import Link from '../../Link/Link';
import { ButtonVariant } from '../../Button/types';
import cx from 'classnames';

export const _isCustomDataObject = (item: any): item is CustomDataObject => {
    return !!item && typeof item === 'object' && 'value' in item;
};

const _isIconType = (item: any): item is CustomIconObject => {
    return !!item && typeof item === 'object' && item.type === 'icon';
};

const _isButtonType = (item: any): item is CustomButtonObject => {
    return !!item && typeof item === 'object' && item.type === 'button';
};

const _isLinkType = (item: any): item is CustomLinkObject => {
    return !!item && typeof item === 'object' && item.type === 'link';
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

                const data = item[key] as CustomDataObject;

                const { value, type } = _isCustomDataObject(data) ? data : { value: data, type: 'text' };

                const icon = _isIconType(data) ? { url: data.config.src, alt: data.config.alt || data.value } : undefined;
                const buttonCallback = _isButtonType(data)
                    ? (e: JSXInternal.TargetedMouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
                          e.stopPropagation();
                          data.config.action();
                      }
                    : undefined;

                return (
                    <DataGridCell aria-labelledby={String(key)} key={key} column={key} position={position}>
                        <div className="adyen-pe-data-grid__cell-value">
                            {_isIconType(data) && icon?.url && (
                                <>
                                    <Icon {...icon} />
                                    {value.trim() && <span>{value}</span>}
                                </>
                            )}
                            {type === 'text' && <span className={cx(data?.config?.classNames)}>{value}</span>}
                            {type === 'button' && (
                                <Button className={cx(data.config?.classNames)} onClick={buttonCallback} variant={ButtonVariant.SECONDARY}>
                                    {value}
                                </Button>
                            )}
                            {_isLinkType(data) && (
                                <Link classNames={data.config.classNames} href={data.config.href} target={data.config.target}>
                                    {value}
                                </Link>
                            )}
                        </div>
                    </DataGridCell>
                );
            })}
        </>
    );
};

import { ComponentChild, ComponentChildren, toChildArray } from 'preact';
import classnames from 'classnames';
import Spinner from '../Spinner';
import DataGridCell from './DataGridCell';
import './DataGrid.scss';
import { InteractionKeyCode } from '@src/components/types';
import { useCallback } from 'preact/hooks';

export default DataGrid;

interface DataGridColumn<Item> {
    label: string;
    key: keyof Item;
}

interface DataGridProps<Item extends Array<Item>, ClickedField extends keyof Item[number]> {
    children: ComponentChildren;
    columns: DataGridColumn<Item[number]>[];
    condensed: boolean;
    data: Item;
    loading: boolean;
    outline: boolean;
    scrollable: boolean;
    Footer?: any;
    onRowClick?: { retrievedField: ClickedField; callback: (value: Item[0][ClickedField]) => void };
    customCells?: {
        [k in keyof Partial<Item[number]>]: ({ key, value, item }: { key: k; value: Item[number][k]; item: Item[number] }) => ComponentChild;
    };
}

function DataGrid<Items extends Array<any>, ClickedField extends keyof Items[number]>(props: DataGridProps<Items, ClickedField>) {
    const children = toChildArray(props.children);
    const footer = children.find((child: ComponentChild) => (child as any)?.['type'] === DataGridFooter);

    return (
        <div
            className={classnames('adyen-fp-data-grid', {
                'adyen-fp-data-grid--condensed': props.condensed,
                'adyen-fp-data-grid--outline': props.outline,
                'adyen-fp-data-grid--scrollable': props.scrollable,
                'adyen-fp-data-grid--loading': props.loading,
            })}
        >
            {props.loading ? (
                <Spinner />
            ) : (
                <>
                    <div className="adyen-fp-data-grid__table-wrapper">
                        <table className="adyen-fp-data-grid__table">
                            <thead className="adyen-fp-data-grid__head">
                                <tr role="rowheader" className="adyen-fp-data-grid__row">
                                    {props.columns.map(item => (
                                        <th
                                            role="columnheader"
                                            id={String(item.key)}
                                            className="adyen-fp-data-grid__cell adyen-fp-data-grid__cell--heading"
                                            key={item.key}
                                        >
                                            {item.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <DataGridBody<Items, ClickedField> {...props} />
                        </table>
                    </div>
                    {footer}
                </>
            )}
        </div>
    );
}

function DataGridBody<Items extends Array<any>, ClickedField extends keyof Items[number]>(props: DataGridProps<Items, ClickedField>) {
    return (
        <tbody className="adyen-fp-data-grid__body">
            {props.data.map(item => (
                <tr
                    className={classnames('adyen-fp-data-grid__row', { 'adyen-fp-data-grid--clickable-row': Boolean(props.onRowClick) })}
                    key={item}
                    onClick={
                        props.onRowClick
                            ? () => props.onRowClick?.retrievedField && props.onRowClick?.callback?.(item[props.onRowClick.retrievedField])
                            : undefined
                    }
                >
                    {props.columns.map(({ key }) => {
                        if (props.customCells?.[key])
                            return (
                                <DataGridCell aria-labelledby={String(key)} key={key}>
                                    {props.customCells[key]({
                                        key,
                                        value: item[key],
                                        item,
                                    })}
                                </DataGridCell>
                            );

                        return (
                            <DataGridCell aria-labelledby={String(key)} key={key}>
                                {item[key]}
                            </DataGridCell>
                        );
                    })}
                </tr>
            ))}
        </tbody>
    );
}

DataGrid.Footer = DataGridFooter;

function DataGridFooter({ children }: { children: ComponentChild }) {
    return <div className="adyen-fp-data-grid__footer">{children}</div>;
}

DataGrid.defaultProps = {
    condensed: false,
    outline: true,
    scrollable: true,
};

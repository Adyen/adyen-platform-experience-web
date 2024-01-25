import { ComponentChild, toChildArray } from 'preact';
import classnames from 'classnames';
import Spinner from '../Spinner';
import './DataGrid.scss';
import { TableBody } from '@src/components/internal/DataGrid/components/TableBody';
import { InteractiveBody } from '@src/components/internal/DataGrid/components/InteractiveBody';
import { CellTextPosition, DataGridProps } from './types';

export const INITIAL_STATE = Object.freeze({
    activeIndex: -1,
    index: -1,
});

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
                                            className={classnames('adyen-fp-data-grid__cell adyen-fp-data-grid__cell--heading', {
                                                'adyen-fp-data-grid__cell--right': item.position === CellTextPosition.RIGHT,
                                                'adyen-fp-data-grid__cell--center': item.position === CellTextPosition.CENTER,
                                            })}
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
            {props.onRowClick ? (
                <InteractiveBody<Items, ClickedField>
                    data={props.data}
                    columns={props.columns}
                    onRowClick={props.onRowClick}
                    customCells={props.customCells}
                />
            ) : (
                <TableBody<Items, ClickedField> data={props.data} customCells={props.customCells} columns={props.columns} />
            )}
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

export default DataGrid;

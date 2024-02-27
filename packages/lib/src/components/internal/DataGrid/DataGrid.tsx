import { ComponentChild, toChildArray } from 'preact';
import classnames from 'classnames';
import './DataGrid.scss';
import { TableBody } from '@src/components/internal/DataGrid/components/TableBody';
import { InteractiveBody } from '@src/components/internal/DataGrid/components/InteractiveBody';
import { CellTextPosition, DataGridColumn, DataGridProps } from './types';
import SkeletonBody from '@src/components/internal/DataGrid/components/SkeletonBody';
import { ErrorMessageDisplay } from '@src/components/internal/ErrorMessageDisplay/ErrorMessageDisplay';
import { useMemo } from 'preact/hooks';
import emptyTableIcon from '../../../images/no-data-female.svg';

export const INITIAL_STATE = Object.freeze({
    activeIndex: -1,
    index: -1,
});

type CellKey<
    Item extends Array<any>,
    Columns extends Array<DataGridColumn<Extract<keyof Item[number], string>>>,
    Column extends DataGridColumn<Extract<keyof Item[number], string>>,
    T extends Columns[number]['key']
> = {
    [k in Column['key']]: k;
}[T];

export type CustomCell<
    Item extends Array<any>,
    Columns extends Array<DataGridColumn<Extract<keyof Item[number], string>>>,
    T extends Columns[number]
> = {
    [k in T['key']]?: (
        props: Item[0][k] extends NonNullable<Item[0][k]>
            ? { key: CellKey<Item, Columns, Columns[number], k>; value: Item[number][k]; item: Item[number] }
            : { key: CellKey<Item, Columns, Columns[number], k>; item: Item[number] }
    ) => ComponentChild;
};

function DataGrid<
    Items extends Array<any>,
    Columns extends Array<DataGridColumn<Extract<keyof Items[number], string>>>,
    ClickedField extends keyof Items[number],
    CustomCells extends CustomCell<Items, Columns, Columns[number]>
>(props: DataGridProps<Items, Columns, ClickedField, CustomCells>) {
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

                        <DataGridBody<Items, Columns, ClickedField, CustomCells> {...props} />
                    </table>
                </div>
                {footer}
            </>
        </div>
    );
}

function DataGridBody<
    Items extends Array<any>,
    Columns extends Array<DataGridColumn<Extract<keyof Items[number], string>>>,
    ClickedField extends keyof Items[number],
    CustomCells extends CustomCell<Items, Columns, Columns[number]>
>({ errorDisplay, ...props }: DataGridProps<Items, Columns, ClickedField, CustomCells>) {
    const emptyBody = !props.loading && props.data?.length === 0 && !props.error;

    const showSkeleton = useMemo(() => props.loading || emptyBody || props.error, [emptyBody, props.error, props.loading]);
    return (
        <tbody
            className={classnames('adyen-fp-data-grid__body', {
                'adyen-fp-data-grid__body--empty': emptyBody || props.error,
            })}
        >
            {showSkeleton ? (
                <SkeletonBody
                    columnsNumber={props.columns.length}
                    loading={props.loading}
                    emptyMessageDisplay={
                        props.error && errorDisplay ? (
                            errorDisplay()
                        ) : (
                            <ErrorMessageDisplay
                                title={props.emptyTableMessage?.title ?? 'thereAreNoResults'}
                                message={props.emptyTableMessage?.message}
                                imageDesktop={emptyTableIcon}
                                centered
                            />
                        )
                    }
                />
            ) : props.onRowClick ? (
                <InteractiveBody<Items, Columns, ClickedField, CustomCells>
                    data={props.data}
                    columns={props.columns}
                    onRowClick={props.onRowClick}
                    customCells={props.customCells}
                />
            ) : (
                <TableBody<Items, Columns, ClickedField, CustomCells> data={props.data} customCells={props.customCells} columns={props.columns} />
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

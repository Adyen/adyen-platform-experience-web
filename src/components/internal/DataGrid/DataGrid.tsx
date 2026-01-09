import { ComponentChild, toChildArray } from 'preact';
import classnames from 'classnames';
import './DataGrid.scss';
import { TableBody } from './components/TableBody';
import { InteractiveBody } from './components/InteractiveBody';
import { DataGridColumn, DataGridProps } from './types';
import SkeletonBody from './components/SkeletonBody';
import { ErrorMessageDisplay } from '../ErrorMessageDisplay/ErrorMessageDisplay';
import { useMemo } from 'preact/hooks';
import { DataGridProvider } from './utils/DataGridProvider';
import { useDataGridContext } from './hooks/useDataGridContext';
import { TableHeaderCell } from './components/TableHeaderCell';
import useCoreContext from '../../../core/Context/useCoreContext';

export const INITIAL_STATE = Object.freeze({
    activeIndex: -1,
    index: -1,
});

export type CustomCell<
    Item extends Array<any>,
    Columns extends Array<DataGridColumn<Extract<keyof Item[number], string>>>,
    T extends Columns[number],
> = {
    [k in T['key']]?: (
        props: Item[0][k] extends NonNullable<Item[0][k]>
            ? { key: k; value: Item[number][k]; item: Item[number]; rowIndex: number }
            : { key: k; item: Item[number]; rowIndex: number }
    ) => ComponentChild;
};

function DataGrid<
    Items extends Array<any>,
    Columns extends Array<DataGridColumn<Extract<keyof Items[number], string>>>,
    ClickedField extends keyof Items[number],
    CustomCells extends CustomCell<Items, Columns, Columns[number]>,
>({ errorDisplay, ...props }: DataGridProps<Items, Columns, ClickedField, CustomCells>) {
    return (
        <div style={{ width: '100%' }}>
            <DataGridProvider>
                <DataGridTable {...props} errorDisplay={errorDisplay} />
            </DataGridProvider>
        </div>
    );
}

function DataGridTable<
    Items extends Array<any>,
    Columns extends Array<DataGridColumn<Extract<keyof Items[number], string>>>,
    ClickedField extends keyof Items[number],
    CustomCells extends CustomCell<Items, Columns, Columns[number]>,
>({ autoFitColumns, errorDisplay, ...props }: DataGridProps<Items, Columns, ClickedField, CustomCells>) {
    const children = useMemo(() => toChildArray(props.children), [props.children]);
    const footer = useMemo(() => children.find((child: ComponentChild) => (child as any)?.['type'] === DataGridFooter), [children]);
    const emptyBody = useMemo(() => props.data?.length === 0, [props.data]);
    const showMessage = useMemo(() => !props.loading && (emptyBody || props.error), [emptyBody, props.error, props.loading]);
    const { getMinWidthByColumn } = useDataGridContext();
    const { getImageAsset } = useCoreContext();

    const visibleCols = props.columns
        .filter(column => column.visible !== false)
        .map(column => ({ ...column, minWidth: getMinWidthByColumn(column.key) }));

    const cellWidths = visibleCols.map(col => `minmax(${(col.minWidth || 100) + (props.narrowColumns ? 0 : 40)}px, ${col.flex || 1}fr)`).join(' ');

    return (
        <div
            className={classnames('adyen-pe-data-grid', {
                'adyen-pe-data-grid--condensed': props.condensed,
                'adyen-pe-data-grid--outline': props.outline,
                'adyen-pe-data-grid--scrollable': props.scrollable,
                'adyen-pe-data-grid--loading': props.loading,
                'adyen-pe-data-grid--empty': emptyBody || props.error,
            })}
            style={
                autoFitColumns
                    ? undefined
                    : {
                          '--adyen-pe-data-grid-cols': visibleCols.length,
                          '--adyen-pe-data-grid-cells': cellWidths,
                      }
            }
        >
            <div className="adyen-pe-data-grid__table-wrapper">
                <div role="table" className="adyen-pe-data-grid__table">
                    <div className="adyen-pe-data-grid__head" role="rowgroup">
                        <div role="rowheader" className="adyen-pe-data-grid__header" style={props.loading ? { width: '100%' } : {}}>
                            {visibleCols.map(item => (
                                <TableHeaderCell key={item.key} label={item.label} position={item.position} cellKey={item.key} />
                            ))}
                        </div>
                    </div>

                    <DataGridBody<Items, Columns, ClickedField, CustomCells> {...props} columns={visibleCols as Columns} emptyBody={emptyBody} />
                </div>
                {showMessage &&
                    (emptyBody && !props.error ? (
                        <ErrorMessageDisplay
                            withHeaderOffset
                            title={props.emptyTableMessage?.title ?? 'common.errors.noResults'}
                            message={props.emptyTableMessage?.message}
                            imageDesktop={getImageAsset?.({ name: 'no-results-found' })}
                            imageMobile={getImageAsset?.({ name: 'no-results-found', subFolder: 'images/small' })}
                            centered
                        />
                    ) : props.error && errorDisplay ? (
                        errorDisplay()
                    ) : null)}
            </div>
            {footer}
        </div>
    );
}

function DataGridBody<
    Items extends Array<any>,
    Columns extends Array<DataGridColumn<Extract<keyof Items[number], string>>>,
    ClickedField extends keyof Items[number],
    CustomCells extends CustomCell<Items, Columns, Columns[number]>,
>(props: DataGridProps<Items, Columns, ClickedField, CustomCells> & { emptyBody: boolean }) {
    const showSkeleton = useMemo(() => props.loading || props.emptyBody || props.error, [props.emptyBody, props.error, props.loading]);

    return (
        <div
            role="rowgroup"
            className={classnames('adyen-pe-data-grid__body')}
            style={showSkeleton && { display: 'grid', gridTemplateColumns: '1fr' }}
        >
            {showSkeleton ? (
                <SkeletonBody columnsNumber={props.columns.length} loading={props.loading} />
            ) : props.onRowClick ? (
                <InteractiveBody<Items, Columns, ClickedField, CustomCells>
                    onRowHover={props.onRowHover}
                    data={props.data}
                    columns={props.columns}
                    onRowClick={props.onRowClick}
                    customCells={props.customCells}
                />
            ) : (
                <TableBody<Items, Columns, ClickedField, CustomCells>
                    onRowHover={props.onRowHover}
                    data={props.data}
                    customCells={props.customCells}
                    columns={props.columns}
                />
            )}
        </div>
    );
}

DataGrid.Footer = DataGridFooter;

function DataGridFooter({ children }: { children: ComponentChild }) {
    return <div className="adyen-pe-data-grid__footer">{children}</div>;
}

DataGrid.defaultProps = {
    condensed: false,
    outline: true,
    scrollable: true,
};

export default DataGrid;

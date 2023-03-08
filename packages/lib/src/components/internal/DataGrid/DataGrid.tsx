import { ComponentChildren, toChildArray } from 'preact';
import classnames from 'classnames';
import Spinner from '../Spinner';
import DataGridCell from './DataGridCell';
import './DataGrid.scss';

export default DataGrid;

interface DataGridColumn {
    label: string;
    key: string;
}

interface DataGridProps {
    children: ComponentChildren;
    columns: DataGridColumn[];
    condensed: Boolean;
    data: Object[];
    loading: Boolean;
    outline: Boolean;
    scrollable: Boolean;
    Footer?: any;
    [key: string]: any;
}

function DataGrid(props: DataGridProps) {
    const children = toChildArray(props.children);
    const footer = children.find(child => child['type'] === DataGridFooter);

    return (
        <div
            class={classnames('adyen-fp-data-grid', {
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
                    <div class="adyen-fp-data-grid__table-wrapper">
                        <table class="adyen-fp-data-grid__table">
                            <thead class="adyen-fp-data-grid__head">
                                <tr class="adyen-fp-data-grid__row">
                                    {props.columns.map(item => (
                                        <th class="adyen-fp-data-grid__cell" key={item.key}>
                                            {item.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <DataGridBody {...props} />
                        </table>
                    </div>
                    {footer}
                </>
            )}
        </div>
    );
}

function DataGridBody(props) {
    return (
        <tbody class="adyen-fp-data-grid__body">
            {props.data.map(item => (
                <tr class="adyen-fp-data-grid__row" key={item}>
                    {props.columns.map(({ key }) => {
                        if (props.customCells?.[key]) return (
                            <DataGridCell key={key}>
                                {props.customCells[key](key, item)}
                            </DataGridCell>
                        );

                        return <DataGridCell key={key}>{item[key]}</DataGridCell>;
                    })}
                </tr>
            ))}
        </tbody>
    );
}

DataGrid.Footer = DataGridFooter;
function DataGridFooter({ children }) {
    return <div class="adyen-fp-data-grid__footer">{children}</div>;
}

DataGrid.defaultProps = {
    condensed: false,
    outline: true,
    scrollable: true,
};

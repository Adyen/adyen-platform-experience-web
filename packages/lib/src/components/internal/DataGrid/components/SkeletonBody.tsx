import cx from 'classnames';
import '../DataGrid.scss';
import { VNode } from 'preact';

const SkeletonBody = ({ columnsNumber, loading, emptyMessageDisplay }: { columnsNumber: number; loading: boolean; emptyMessageDisplay?: VNode }) => {
    const rows = Array.from({ length: 10 }, (_, index) => index);
    const columns = Array.from({ length: columnsNumber }, (_, index) => index);
    return (
        <>
            {rows.map((_, i) => (
                <tr className="adyen-pe-data-grid__row" key={`adyen-pe-data-grid-skeleton-row-${i}`}>
                    {columns.map((_, index) => (
                        <td key={`adyen-pe-data-grid-skeleton-cell-${index}`} className="adyen-pe-data-grid__cell adyen-pe-data-grid__skeleton-cell">
                            <span
                                className={cx({
                                    'adyen-pe-data-grid__skeleton-cell-content adyen-pe-data-grid__skeleton-cell-content--loading': loading,
                                    'adyen-pe-data-grid__empty-cell': !loading,
                                })}
                            />
                        </td>
                    ))}
                </tr>
            ))}
            {!loading && emptyMessageDisplay && emptyMessageDisplay}
        </>
    );
};

export default SkeletonBody;

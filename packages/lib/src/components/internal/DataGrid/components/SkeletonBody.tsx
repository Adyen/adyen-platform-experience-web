import cx from 'classnames';
import '../DataGrid.scss';
import { VNode } from 'preact';

const SkeletonBody = ({ columnsNumber, loading, emptyMessageDisplay }: { columnsNumber: number; loading: boolean; emptyMessageDisplay?: VNode }) => {
    const rows = Array.from({ length: 10 }, (_, index) => index);
    const columns = Array.from({ length: columnsNumber }, (_, index) => index);
    return (
        <>
            {rows.map((_, i) => (
                <tr className="adyen-fp-data-grid__row" key={`adyen-fp-data-grid-skeleton-row-${i}`}>
                    {columns.map((_, index) => (
                        <td key={`adyen-fp-data-grid-skeleton-cell-${index}`} className="adyen-fp-data-grid__cell adyen-fp-data-grid__skeleton-cell">
                            <span
                                className={cx({
                                    'adyen-fp-data-grid__skeleton-cell-content adyen-fp-data-grid__skeleton-cell-content--loading': loading,
                                    'adyen-fp-data-grid__empty-cell': !loading,
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

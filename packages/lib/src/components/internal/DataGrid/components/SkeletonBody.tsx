import '../DataGrid.scss';
const SkeletonBody = ({ columnsNumber }: { columnsNumber: number }) => {
    const rows = Array.from({ length: 5 }, (_, index) => index);
    const columns = Array.from({ length: columnsNumber }, (_, index) => index);
    return (
        <>
            {rows.map((_, i) => (
                <tr className="adyen-fp-data-grid__row" key={`adyen-fp-skeleton-row-${i}`}>
                    {columns.map((_, index) => (
                        <td key={`adyen-fp-skeleton-cell-${index}`} className="adyen-fp-data-grid__cell adyen-fp-data-grid__skeleton-cell">
                            <span className="adyen-fp-data-grid__skeleton-cell-content"></span>
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
};

export default SkeletonBody;

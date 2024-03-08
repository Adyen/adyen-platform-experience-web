import cx from 'classnames';
import { useMemo } from 'preact/hooks';

const TransactionDataSkeleton = ({ isLoading, skeletonRowNumber = 0 }: { isLoading?: boolean; skeletonRowNumber?: number }) => {
    const skeletonRows = useMemo(() => Array.from({ length: skeletonRowNumber }, (_, index) => index), [skeletonRowNumber]);

    return (
        <>
            {skeletonRows.map(key => (
                <span
                    className={cx({ 'adyen-fp-transaction-data__skeleton': true, 'adyen-fp-transaction-data__skeleton-loading-content': isLoading })}
                    key={`transaction-data-skeleton-${key}`}
                />
            ))}
        </>
    );
};

export default TransactionDataSkeleton;

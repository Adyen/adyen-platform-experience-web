import cx from 'classnames';
import { useMemo } from 'preact/hooks';

const TransactionDataSkeleton = ({ isLoading, skeletonRowNumber = 0 }: { isLoading?: boolean; skeletonRowNumber?: number }) => {
    const skeletonRows = useMemo(() => Array.from({ length: skeletonRowNumber }, (_, index) => index), [skeletonRowNumber]);

    return (
        <div className="adyen-pe-transaction-data__skeleton-container">
            <div className={'adyen-pe-transaction-data__status-skeleton'}>
                <span
                    className={cx('adyen-pe-transaction-data__skeleton', {
                        'adyen-pe-transaction-data__skeleton-loading-content': isLoading,
                    })}
                />
                <span
                    className={cx('adyen-pe-transaction-data__skeleton', {
                        'adyen-pe-transaction-data__skeleton-loading-content': isLoading,
                    })}
                />
            </div>
            {skeletonRows.map(key => (
                <span
                    className={cx({
                        'adyen-pe-transaction-data__skeleton': true,
                        'adyen-pe-transaction-data__skeleton-loading-content': isLoading,
                    })}
                    key={`transaction-data-skeleton-${key}`}
                />
            ))}
        </div>
    );
};

export default TransactionDataSkeleton;

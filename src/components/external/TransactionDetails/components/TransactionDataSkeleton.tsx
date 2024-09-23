import cx from 'classnames';
import { memo } from 'preact/compat';
import { TX_DATA_SKELETON, TX_DATA_SKELETON_CONTAINER, TX_DATA_SKELETON_LOADING, TX_DATA_STATUS_SKELETON } from '../constants';

const TransactionDataSkeleton = ({ isLoading, skeletonRowNumber = 0 }: { isLoading?: boolean; skeletonRowNumber?: number }) => {
    const className = cx(TX_DATA_SKELETON, TX_DATA_SKELETON_LOADING);
    const skeletonRows = Array.from({ length: skeletonRowNumber });
    const statusSkeletonRows = Array.from({ length: 2 });

    return (
        <div className={TX_DATA_SKELETON_CONTAINER}>
            <div className={TX_DATA_STATUS_SKELETON}>
                {statusSkeletonRows.map((_, index) => (
                    <span className={className} key={`transaction-data-status-skeleton-${index}`} />
                ))}
            </div>
            {skeletonRows.map((_, index) => (
                <span className={className} key={`transaction-data-skeleton-${index}`} />
            ))}
        </div>
    );
};

export default memo(TransactionDataSkeleton);

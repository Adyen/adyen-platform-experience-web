import { memo } from 'preact/compat';
import { TX_DATA_SKELETON, TX_DATA_SKELETON_LOADING } from '../constants';

const TransactionDataSkeleton = ({ skeletonRowNumber = 0 }: { skeletonRowNumber?: number }) => {
    const className = `${TX_DATA_SKELETON} ${TX_DATA_SKELETON_LOADING}`;
    const skeletonRows = Array.from({ length: skeletonRowNumber });
    return (
        <>
            {skeletonRows.map((_, index) => (
                <span className={className} key={`transaction-data-skeleton-${index}`} />
            ))}
        </>
    );
};

export default memo(TransactionDataSkeleton);

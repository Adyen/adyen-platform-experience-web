import cx from 'classnames';
import { memo } from 'preact/compat';
import { SKELETON_CLASS, SKELETON_CONTAINER, SKELETON_LOADING, STATUS_SKELETON } from './constants';

const DataOverviewDetailsSkeleton = ({ skeletonRowNumber = 0 }: { skeletonRowNumber?: number }) => {
    const className = cx(SKELETON_CLASS, SKELETON_LOADING);
    const skeletonRows = Array.from({ length: skeletonRowNumber });
    const statusSkeletonRows = Array.from({ length: 2 });

    return (
        <div className={SKELETON_CONTAINER}>
            <div className={STATUS_SKELETON}>
                {statusSkeletonRows.map((_, index) => (
                    <span className={className} key={`status-skeleton-${index}`} />
                ))}
            </div>
            {skeletonRows.map((_, index) => (
                <span className={className} key={`skeleton-${index}`} />
            ))}
        </div>
    );
};

export default memo(DataOverviewDetailsSkeleton);

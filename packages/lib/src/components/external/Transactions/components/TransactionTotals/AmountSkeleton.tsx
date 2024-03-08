import classNames from 'classnames';
import { SKELETON_CLASS, SKELETON_LOADING_CLASS } from '@src/components/external/Transactions/components/TransactionTotals/constants';

const AmountSkeleton = ({ isLoading }: { isLoading: boolean }) => {
    return (
        <span
            className={classNames(SKELETON_CLASS, {
                [SKELETON_LOADING_CLASS]: isLoading,
            })}
        ></span>
    );
};

export default AmountSkeleton;

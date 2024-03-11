import classNames from 'classnames';
import { BASE_CLASS, LOADING_CLASS, MARGIN_CLASS } from '@src/components/external/Transactions/components/AmountSkeleton/constants';
import './AmountSkeleton.scss';
import { FC } from 'preact/compat';
import { AmountSkeletonProps } from '@src/components/external/Transactions/components/AmountSkeleton/types';

export const AmountSkeleton: FC<AmountSkeletonProps> = ({ hasMargin = false, isLoading = false, width }) => {
    return <span className={classNames(BASE_CLASS, { [LOADING_CLASS]: isLoading, [MARGIN_CLASS]: hasMargin })} style={{ width }}></span>;
};

export default AmountSkeleton;

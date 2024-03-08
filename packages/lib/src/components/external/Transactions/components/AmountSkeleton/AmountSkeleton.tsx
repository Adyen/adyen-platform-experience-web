import classNames from 'classnames';
import { BASE_CLASS, LOADING_CLASS } from '@src/components/external/Transactions/components/AmountSkeleton/constants';
import './AmountSkeleton.scss';
import { FC } from 'preact/compat';
import { AmountSkeletonProps } from '@src/components/external/Transactions/components/AmountSkeleton/types';

export const AmountSkeleton: FC<AmountSkeletonProps> = ({ isLoading = false, width }) => {
    return <span className={classNames(BASE_CLASS, { [LOADING_CLASS]: isLoading })} style={{ width }}></span>;
};

export default AmountSkeleton;

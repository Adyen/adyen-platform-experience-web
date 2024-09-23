import classNames from 'classnames';
import { BASE_CLASS, LOADING_CLASS, MARGIN_CLASS } from './constants';
import './AmountSkeleton.scss';
import { FC } from 'preact/compat';
import { AmountSkeletonProps } from './types';

export const AmountSkeleton: FC<AmountSkeletonProps> = ({ hasMargin = false, isLoading = false, width }) => {
    return <span className={classNames(BASE_CLASS, { [LOADING_CLASS]: isLoading, [MARGIN_CLASS]: hasMargin })} style={{ width }}></span>;
};

export default AmountSkeleton;

import cx from 'classnames';

const AmountSkeleton = ({ isLoading }: { isLoading: boolean }) => {
    return (
        <span
            className={cx('adyen-fp-transactions-total__skeleton', {
                'adyen-fp-transactions-total__skeleton--loading': isLoading,
            })}
        ></span>
    );
};

export default AmountSkeleton;

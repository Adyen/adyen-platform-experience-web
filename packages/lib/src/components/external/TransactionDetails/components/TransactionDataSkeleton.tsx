import cx from 'classnames';

const TransactionDataSkeleton = ({ isLoading }: { isLoading?: boolean }) => (
    <span className={cx({ 'adyen-fp-transaction-data__skeleton': true, 'adyen-fp-transaction-data__skeleton-loading-content': isLoading })} />
);

export default TransactionDataSkeleton;

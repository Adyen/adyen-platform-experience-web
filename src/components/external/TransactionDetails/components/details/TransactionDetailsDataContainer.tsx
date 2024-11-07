import { PropsWithChildren } from 'preact/compat';
import { TX_DATA_CONTAINER } from '../constants';
import cx from 'classnames';

const TransactionDetailsDataContainer = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
    <div className={cx(TX_DATA_CONTAINER, className)}>{children}</div>
);

export default TransactionDetailsDataContainer;

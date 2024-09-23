import { FunctionalComponent } from 'preact';
import { PropsWithChildren } from 'preact/compat';
import { TX_DATA_CONTAINER } from '../constants';

const TransactionDetailsDataContainer: FunctionalComponent<PropsWithChildren> = ({ children }) => <div className={TX_DATA_CONTAINER}>{children}</div>;

export default TransactionDetailsDataContainer;

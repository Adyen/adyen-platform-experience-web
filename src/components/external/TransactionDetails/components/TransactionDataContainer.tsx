import cx from 'classnames';
import useTransactionDataContext from '../context';
import TransactionDataActionsBar from './TransactionDataActionsBar';
import TransactionDataSkeleton from './TransactionDataSkeleton';
import TransactionDataView from './TransactionDataView';
import TransactionRefundView from './TransactionRefundView';
import { TX_DATA_ACTION_BAR, TX_DATA_ACTION_BAR_REFUND, TX_DATA_CLASS } from '../constants';

const TransactionDataContainer = () => {
    const { dataViewActive, isLoading } = useTransactionDataContext();
    return isLoading ? (
        <TransactionDataSkeleton skeletonRowNumber={6} />
    ) : (
        <div className={TX_DATA_CLASS}>
            {dataViewActive ? <TransactionDataView /> : <TransactionRefundView />}
            <div className={cx(TX_DATA_ACTION_BAR, { [TX_DATA_ACTION_BAR_REFUND]: !dataViewActive })}>
                <TransactionDataActionsBar />
            </div>
        </div>
    );
};

export default TransactionDataContainer;

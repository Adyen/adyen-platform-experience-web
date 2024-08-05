import cx from 'classnames';
import useTransactionDataContext from '../context';
import TransactionDataSkeleton from './TransactionDataSkeleton';
import TransactionDataAmount from './TransactionDataAmount';
import TransactionDataDate from './TransactionDataDate';
import TransactionDataPaymentMethod from './TransactionDataPaymentMethod';
import TransactionDataProperties from './TransactionDataProperties';
import TransactionDataTags from './TransactionDataTags';
import TransactionRefundAmount from './TransactionRefundAmount';
import TransactionRefundNotice from './TransactionRefundNotice';
import TransactionRefundReason from './TransactionRefundReason';
import TransactionRefundReference from './TransactionRefundReference';
import ButtonActions from '../../../internal/Button/ButtonActions/ButtonActions';
import { ButtonActionsLayoutBasic } from '../../../internal/Button/ButtonActions/types';
import { TX_DATA_ACTION_BAR, TX_DATA_ACTION_BAR_REFUND, TX_DATA_CLASS, TX_DATA_CONTAINER, TX_DATA_CONTAINER_NO_PADDING } from '../constants';

const TransactionDataContainer = () => {
    const { dataViewActive, isLoading, viewActions } = useTransactionDataContext();

    return isLoading ? (
        <TransactionDataSkeleton skeletonRowNumber={6} />
    ) : (
        <div className={TX_DATA_CLASS}>
            {dataViewActive ? (
                <>
                    <div className={TX_DATA_CONTAINER}>
                        <TransactionDataTags />
                        <TransactionDataAmount />
                        <TransactionDataPaymentMethod />
                        <TransactionDataDate />
                    </div>
                    <TransactionDataProperties />
                </>
            ) : (
                <>
                    <TransactionRefundNotice />
                    <TransactionRefundAmount />
                    <TransactionRefundReason />
                    <TransactionRefundReference />
                </>
            )}

            {!!viewActions.length && (
                <div className={cx(TX_DATA_ACTION_BAR, { [TX_DATA_ACTION_BAR_REFUND]: !dataViewActive })}>
                    <div className={`${TX_DATA_CONTAINER} ${TX_DATA_CONTAINER_NO_PADDING}`}>
                        <ButtonActions actions={viewActions} layout={ButtonActionsLayoutBasic.BUTTONS_END} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionDataContainer;

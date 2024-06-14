import { SelectedDetail, TransactionDetailData } from '../../../../index';
import TransactionDetails from '../../../TransactionDetails/components/TransactionDetails';
import { hasOwnProperty } from '../../../../../utils/common';
import './TransactionDetailsModal.scss';

const CLASSNAMES = {
    transactionDetailsModal: 'adyen-pe-transaction-details-modal',
};

const isTransactionWithoutId = (data: string | TransactionDetailData): data is TransactionDetailData => hasOwnProperty(data, 'id');
function TransactionDetailsModal({ data }: SelectedDetail) {
    const transactionProps = isTransactionWithoutId(data) ? { transaction: data } : { transactionId: data };

    return (
        <>
            {transactionProps && (
                <div className={CLASSNAMES.transactionDetailsModal}>
                    <TransactionDetails {...transactionProps} />
                </div>
            )}
        </>
    );
}
export default TransactionDetailsModal;

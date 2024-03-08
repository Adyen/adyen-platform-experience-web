import { SelectedDetail, TransactionDetailData } from '@src/components';
import TransactionDetails from '@src/components/external/TransactionDetails/components/TransactionDetails';
import { hasOwnProperty } from '@src/utils/common';

const isTransactionWithoutId = (data: string | TransactionDetailData): data is TransactionDetailData => hasOwnProperty(data, 'id');
function ModalContent({ data }: SelectedDetail) {
    const transactionProps = isTransactionWithoutId(data) ? { transaction: data } : { transactionId: data };

    return <>{transactionProps && <TransactionDetails {...transactionProps} />}</>;
}
export default ModalContent;

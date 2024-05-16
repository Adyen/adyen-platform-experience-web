import { SelectedDetail, TransactionDetailData } from '../../../external';
import TransactionDetails from '../../../external/TransactionDetails/components/TransactionDetails';
import { hasOwnProperty } from '../../../../primitives/utils';

const isTransactionWithoutId = (data: string | TransactionDetailData): data is TransactionDetailData => hasOwnProperty(data, 'id');
function ModalContent({ data }: SelectedDetail) {
    const transactionProps = isTransactionWithoutId(data) ? { transaction: data } : { transactionId: data };

    return <>{transactionProps && <TransactionDetails {...transactionProps} />}</>;
}
export default ModalContent;

import { hasOwnProperty } from '../../../../utils/common';
import { TransactionDetailData } from '../../../external';
import DataOverviewDetails from '../../DataOverviewDetails/DataOverviewDetails';
import { SelectedDetail } from '../../DataOverviewDetails/types';

const isTransactionWithoutId = (data: string | TransactionDetailData): data is TransactionDetailData => hasOwnProperty(data, 'id');
function ModalContent({ type, data }: SelectedDetail) {
    const detailProps = isTransactionWithoutId(data) ? { data: data } : { id: data };

    return <>{detailProps && <DataOverviewDetails {...detailProps} type={type} />}</>;
}
export default ModalContent;

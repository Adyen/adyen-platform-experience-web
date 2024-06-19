import { useMemo } from 'preact/hooks';
import { hasOwnProperty } from '../../../../utils';
import { TransactionDetailData } from '../../../external';
import DataOverviewDetails from '../../DataOverviewDetails/DataOverviewDetails';
import { DetailsComponentProps, DetailsWithId, PayoutDetailsWithIdProps, SelectedDetail } from '../../DataOverviewDetails/types';
import './ModalContent.scss';

const CLASSNAMES = {
    base: 'adyen-pe-modal-content',
};

const isDetailsWithoutId = (data: string | TransactionDetailData): data is TransactionDetailData => hasOwnProperty(data, 'id');

function ModalContent({ type, data }: SelectedDetail) {
    const detailProps: DetailsComponentProps = useMemo(() => {
        if (type === 'payout') {
            return { ...(data as PayoutDetailsWithIdProps), type: 'payout' };
        } else {
            return isDetailsWithoutId(data as string | TransactionDetailData)
                ? { data: data as TransactionDetailData, type: type }
                : ({ id: data, type: type } as DetailsWithId);
        }
    }, [data, type]);

    return (
        <>
            {detailProps && (
                <div className={CLASSNAMES.base}>
                    <DataOverviewDetails {...(detailProps as DetailsComponentProps)} />
                </div>
            )}
        </>
    );
}

export default ModalContent;

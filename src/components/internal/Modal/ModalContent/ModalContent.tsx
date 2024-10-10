import { useMemo } from 'preact/hooks';
import DataOverviewDetails from '../../DataOverviewDetails/DataOverviewDetails';
import { DetailsComponentProps, PayoutDetailsWithIdProps, SelectedDetail } from '../../DataOverviewDetails/types';
import './ModalContent.scss';

const CLASSNAMES = {
    base: 'adyen-pe-modal-content',
};

function ModalContent({ type, data }: SelectedDetail) {
    const detailProps: DetailsComponentProps = useMemo(() => {
        if (type === 'payout') {
            return { ...(data as PayoutDetailsWithIdProps & { balanceAccountDescription?: string }), type: 'payout' };
        } else if (type === 'transaction') {
            return { id: data, type: type } as DetailsComponentProps;
        } else {
            return { data: data, type: type } as DetailsComponentProps;
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

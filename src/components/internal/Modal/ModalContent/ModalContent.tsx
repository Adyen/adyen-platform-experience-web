import { useMemo } from 'preact/hooks';
import DataOverviewDetails from '../../DataOverviewDetails/DataOverviewDetails';
import { DetailsComponentProps, PayoutDetailsWithIdProps, SelectedDetail } from '../../DataOverviewDetails/types';
import './ModalContent.scss';

const CLASSNAMES = {
    base: 'adyen-pe-modal-content',
};

function ModalContent({ type, data }: SelectedDetail) {
    const detailProps: DetailsComponentProps = useMemo(() => {
        switch (type) {
            case 'payout':
                return { ...(data as PayoutDetailsWithIdProps & { balanceAccountDescription?: string }), type };
            case 'transaction':
                return { id: data, type } as DetailsComponentProps;
            default:
                return { data, type } as DetailsComponentProps;
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

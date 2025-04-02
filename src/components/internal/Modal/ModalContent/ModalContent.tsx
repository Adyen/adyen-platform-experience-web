import { useMemo } from 'preact/hooks';
import DataOverviewDetails from '../../DataOverviewDetails/DataOverviewDetails';
import { DetailsComponentProps, PayoutDetailsWithIdProps, SelectedDetail } from '../../DataOverviewDetails/types';
import './ModalContent.scss';

const CLASSNAMES = {
    base: 'adyen-pe-modal-content',
};

// [TODO]: Consider covering ...restData with type information (added here as a hack to capture extra details)
function ModalContent({ type, data, dataCustomization, ...restData }: SelectedDetail) {
    const detailProps: DetailsComponentProps = useMemo(() => {
        switch (type) {
            case 'payout':
                return { ...(data as PayoutDetailsWithIdProps & { balanceAccountDescription?: string }), type, ...restData };
            case 'transaction':
                // [TODO]: Consider providing type information for ...restData (added here to provide extra details)
                return { id: data, type, ...restData } as DetailsComponentProps;
            case 'dispute':
                return { id: data, type } as DetailsComponentProps;
            default:
                return { data, type } as DetailsComponentProps;
        }
    }, [data, type]);

    return (
        <>
            {detailProps && (
                <div className={CLASSNAMES.base}>
                    <DataOverviewDetails {...(detailProps as DetailsComponentProps)} dataCustomization={dataCustomization} />
                </div>
            )}
        </>
    );
}

export default ModalContent;

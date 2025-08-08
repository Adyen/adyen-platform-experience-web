import { useMemo } from 'preact/hooks';
import DataOverviewDetails from '../../DataOverviewDetails/DataOverviewDetails';
import { DetailsComponentProps, PayoutDetailsWithIdProps, SelectedDetail } from '../../DataOverviewDetails/types';

// [TODO]: Consider covering ...restData with type information (added here as a hack to capture extra details)
function ModalContent({ type, data, dataCustomization, ...restData }: SelectedDetail) {
    const detailProps: DetailsComponentProps = useMemo(() => {
        switch (type) {
            case 'payout':
                return { ...(data as PayoutDetailsWithIdProps & { balanceAccountDescription?: string }), type, ...restData };
            case 'transaction':
                // [TODO]: Consider providing type information for ...restData (added here to provide extra details)
                return { id: data, type, ...restData } as DetailsComponentProps;
            default:
                return { data, type } as DetailsComponentProps;
        }
    }, [data, restData, type]);

    return detailProps && <DataOverviewDetails {...(detailProps as DetailsComponentProps)} dataCustomization={dataCustomization} />;
}

export default ModalContent;

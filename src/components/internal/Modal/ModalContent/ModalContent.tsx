import { useMemo } from 'preact/hooks';
import DataOverviewDetails from '../../DataOverviewDetails/DataOverviewDetails';
import { DetailsComponentProps, PayoutDetailsWithIdProps, SelectedDetail } from '../../DataOverviewDetails/types';

// [TODO]: Consider covering ...restData with type information (added here as a hack to capture extra details)
function ModalContent({ type, data, dataCustomization, ...restData }: SelectedDetail) {
    const detailProps: DetailsComponentProps | undefined = useMemo(() => {
        switch (type) {
            case 'payout':
                return { ...(data as PayoutDetailsWithIdProps & { balanceAccountDescription?: string }), type, ...restData };
        }
    }, [data, restData, type]);

    return detailProps && <DataOverviewDetails {...(detailProps as DetailsComponentProps)} dataCustomization={dataCustomization} />;
}

export default ModalContent;

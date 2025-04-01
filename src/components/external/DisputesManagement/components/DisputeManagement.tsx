import { useMemo } from 'preact/hooks';
import { useConfigContext } from '../../../../core/ConfigContext';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { useFetch } from '../../../../hooks/useFetch';
import { EMPTY_OBJECT } from '../../../../utils';
import ButtonActions from '../../../internal/Button/ButtonActions/ButtonActions';
import DisputeStatusBox from '../../../internal/StatusBox/StatusBox';
import { TX_STATUS_BOX } from '../../TransactionDetails/components/constants';
import TransactionDetailsDataContainer from '../../TransactionDetails/components/details/TransactionDetailsDataContainer';
import DisputeDataProperties from './DisputeDataProperties';

export const DisputeManagement = ({ id }: { id: string }) => {
    const { getDisputeDetail: getDisputeCall } = useConfigContext().endpoints;
    const { i18n } = useCoreContext();

    const { data, error, isFetching } = useFetch(
        useMemo(
            () => ({
                fetchOptions: { enabled: !!id && !!getDisputeCall },
                queryFn: async () => {
                    const queryParam = { path: { disputePspReference: id } };

                    return getDisputeCall!(EMPTY_OBJECT, { ...queryParam });
                },
            }),
            [id, getDisputeCall]
        )
    );

    if (!data || error || isFetching) return null;

    return (
        <>
            <TransactionDetailsDataContainer className={TX_STATUS_BOX}>
                <DisputeStatusBox type={'dispute'} dispute={data}></DisputeStatusBox>
            </TransactionDetailsDataContainer>

            <DisputeDataProperties dispute={data} />

            {data?.status === 'action_needed' ? <ButtonActions actions={[{ title: i18n.get('disputes.accept'), event: () => {} }]} /> : null}
        </>
    );
};

export default DisputeManagement;

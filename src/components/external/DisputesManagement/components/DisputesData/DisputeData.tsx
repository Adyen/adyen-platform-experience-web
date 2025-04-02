import { DISPUTE_DATA_ACTION_BAR, DISPUTE_DATA_CLASS, DISPUTE_STATUS_BOX } from './constants';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import StatusBox from '../../../../internal/StatusBox/StatusBox';
import DisputeDataProperties from './DisputeDataProperties';
import ButtonActions from '../../../../internal/Button/ButtonActions/ButtonActions';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { useFetch } from '../../../../../hooks/useFetch';
import { useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '../../../../../utils';
import './DisputeData.scss';

export const DisputeData = ({ disputeId }: { disputeId: string }) => {
    const { i18n } = useCoreContext();

    const { getDisputeDetail } = useConfigContext().endpoints;

    const { data: dispute, isFetching } = useFetch(
        useMemo(
            () => ({
                fetchOptions: { enabled: !!disputeId && !!getDisputeDetail },
                queryFn: async () => {
                    return getDisputeDetail!(EMPTY_OBJECT, {
                        path: {
                            disputePspReference: disputeId,
                        },
                    });
                },
            }),
            [getDisputeDetail, disputeId]
        )
    );

    if (!dispute || isFetching) return null; // TODO - Add skeleton

    return (
        <div className={DISPUTE_DATA_CLASS}>
            <div className={DISPUTE_STATUS_BOX}>
                <StatusBox type={'dispute'} dispute={dispute}></StatusBox>
            </div>

            <DisputeDataProperties dispute={dispute} />

            {dispute?.status === 'action_needed' ? (
                <div className={DISPUTE_DATA_ACTION_BAR}>
                    <ButtonActions actions={[{ title: i18n.get('disputes.accept'), event: () => {} }]} />
                </div>
            ) : null}
        </div>
    );
};

export default DisputeData;

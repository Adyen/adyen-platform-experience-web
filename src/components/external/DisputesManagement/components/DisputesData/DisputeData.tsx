import { IAmount } from '../../../../../types';
import DataOverviewDetailsSkeleton from '../../../../internal/DataOverviewDetails/DataOverviewDetailsSkeleton';
import useStatusBoxData from '../../../../internal/StatusBox/useStatusBox';
import DisputeStatusTag from '../../../DisputesOverview/components/DisputesTable/DisputeStatusTag';
import { DISPUTE_DATA_ACTION_BAR, DISPUTE_DATA_CLASS, DISPUTE_STATUS_BOX } from './constants';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import StatusBox from '../../../../internal/StatusBox/StatusBox';
import DisputeDataProperties from './DisputeDataProperties';
import ButtonActions from '../../../../internal/Button/ButtonActions/ButtonActions';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { useFetch } from '../../../../../hooks/useFetch';
import { useCallback, useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '../../../../../utils';
import './DisputeData.scss';
import { useDisputeFlow } from '../../hooks/useDisputeFlow';
import { IDisputeDetail } from '../../../../../types/api/models/disputes';

export const DisputeData = ({ disputeId }: { disputeId: string }) => {
    const { i18n } = useCoreContext();
    const { setDispute, setFlowState } = useDisputeFlow();

    const { getDisputeDetail } = useConfigContext().endpoints;

    const { data: dispute, isFetching } = useFetch(
        useMemo(
            () => ({
                fetchOptions: {
                    enabled: !!disputeId && !!getDisputeDetail,
                    onSuccess: ((dispute: IDisputeDetail) => {
                        setDispute(dispute);
                    }) as any,
                },
                queryFn: async () => {
                    return getDisputeDetail!(EMPTY_OBJECT, {
                        path: {
                            disputePspReference: disputeId,
                        },
                    });
                },
            }),
            [disputeId, getDisputeDetail, setDispute]
        )
    );

    const statusBoxProps = {
        timezone: dispute?.balanceAccount?.timeZone,
        createdAt: dispute?.createdAt,
        amountData: dispute?.amount,
        paymentMethodData: dispute?.paymentMethod,
    } as const;

    const statusBoxOptions = useStatusBoxData(statusBoxProps);

    const onAcceptClick = useCallback(() => {
        dispute && setDispute(dispute);
        setFlowState('accept');
    }, [dispute, setDispute, setFlowState]);

    if (!dispute || isFetching) {
        return <DataOverviewDetailsSkeleton skeletonRowNumber={5} />;
    }

    return (
        <div className={DISPUTE_DATA_CLASS}>
            <div className={DISPUTE_STATUS_BOX}>
                <StatusBox {...statusBoxOptions} tag={<DisputeStatusTag dispute={dispute} />} />
            </div>

            <DisputeDataProperties dispute={dispute} />

            {dispute?.status === 'action_needed' ? (
                <div className={DISPUTE_DATA_ACTION_BAR}>
                    <ButtonActions
                        actions={[
                            {
                                title: i18n.get('dispute.defendDispute'),
                                event: () => {},
                            },
                            {
                                title: i18n.get('disputes.accept'),
                                event: onAcceptClick,
                            },
                        ]}
                    />
                </div>
            ) : null}
        </div>
    );
};

export default DisputeData;

import useCoreContext from '../../../../../core/Context/useCoreContext';
import StatusBox from '../../../../internal/StatusBox/StatusBox';
import ButtonActions from '../../../../internal/Button/ButtonActions/ButtonActions';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { useFetch } from '../../../../../hooks/useFetch';
import { useCallback, useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '../../../../../utils';
import './DisputeData.scss';
import { IDisputeDetail } from '../../../../../types/api/models/disputes';
import { useDisputeFlow } from '../../../DisputeManagement/hooks/useDisputeFlow';
import DisputeDataProperties from '../../../DisputeManagement/components/DisputesData/DisputeDataProperties';
import { DISPUTE_DATA_ACTION_BAR, DISPUTE_DATA_CLASS, DISPUTE_STATUS_BOX } from '../../../DisputeManagement/components/DisputesData/constants';

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

    const onAcceptClick = useCallback(() => {
        dispute && setDispute(dispute);
        setFlowState('accept');
    }, [dispute, setDispute, setFlowState]);

    if (!dispute || isFetching) return null;

    return (
        <div className={DISPUTE_DATA_CLASS}>
            <div className={DISPUTE_STATUS_BOX}>
                <StatusBox
                    date={dispute.dispute.createdAt}
                    paymentMethod={dispute.payment.paymentMethod?.description || dispute.payment.paymentMethod?.lastFourDigits}
                    paymentMethodType={dispute.payment.paymentMethod?.type || null}
                    amount={i18n.amount(dispute.dispute.amount.value, dispute.dispute.amount.currency)}
                ></StatusBox>
            </div>

            <DisputeDataProperties dispute={dispute} />

            {dispute?.dispute?.status === 'action_needed' ? (
                <div className={DISPUTE_DATA_ACTION_BAR}>
                    <ButtonActions
                        actions={[
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

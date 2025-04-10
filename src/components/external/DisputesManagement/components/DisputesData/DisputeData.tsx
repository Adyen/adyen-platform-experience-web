import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useCallback, useMemo } from 'preact/hooks';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { useFetch } from '../../../../../hooks/useFetch';
import { IDispute } from '../../../../../types/api/models/disputes';
import { EMPTY_OBJECT } from '../../../../../utils';
import './DisputeData.scss';
import Alert from '../../../../internal/Alert/Alert';
import { AlertTypeOption, AlertVariantOption } from '../../../../internal/Alert/types';
import ButtonActions from '../../../../internal/Button/ButtonActions/ButtonActions';
import DataOverviewDetailsSkeleton from '../../../../internal/DataOverviewDetails/DataOverviewDetailsSkeleton';
import Link from '../../../../internal/Link/Link';
import StatusBox from '../../../../internal/StatusBox/StatusBox';
import useStatusBoxData from '../../../../internal/StatusBox/useStatusBox';
import { Translation } from '../../../../internal/Translation';
import DisputeStatusTag from '../../../DisputesOverview/components/DisputesTable/DisputeStatusTag';
import { useDisputeFlow } from '../../hooks/useDisputeFlow';
import { IDisputeDetail } from '../../../../../types/api/models/disputes';
import { DISPUTE_DATA_ACTION_BAR, DISPUTE_DATA_CLASS, DISPUTE_DATA_CONTACT_SUPPORT, DISPUTE_STATUS_BOX } from './constants';
import DisputeDataProperties from './DisputeDataProperties';

const DisputeDataAlert = ({
    status,
    isDefended,
    isReasonCodeSupported = true,
}: {
    status: IDispute['status'];
    isDefended: boolean;
    isReasonCodeSupported: boolean;
}) => {
    const { i18n } = useCoreContext();

    if ((status === 'lost' && !isDefended) || status === 'expired') {
        return <Alert type={AlertTypeOption.SUCCESS} variant={AlertVariantOption.TIP} description={i18n.get('dispute.notDefended')} />;
    }
    if (status === 'action_needed' && !isReasonCodeSupported) {
        return (
            <Alert
                type={AlertTypeOption.WARNING}
                variant={AlertVariantOption.TIP}
                description={
                    <Translation
                        translationKey={'dispute.contactSupportToDefendThisDispute'}
                        fills={{
                            contactSupport: (
                                <Link classNames={[DISPUTE_DATA_CONTACT_SUPPORT]} withIcon={false} href={'https://www.adyen.com/'}>
                                    {i18n.get('contactSupport')}
                                </Link>
                            ),
                        }}
                    />
                }
            />
        );
    }
};

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

            {/*TODO: add logic for isReasonCodeSupported*/}
            <DisputeDataAlert
                status={dispute.status}
                isDefended={!!dispute?.latestDefense && !!dispute?.latestDefense?.defendedOn}
                isReasonCodeSupported={true}
            />

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

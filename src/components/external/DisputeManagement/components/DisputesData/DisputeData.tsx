import cx from 'classnames';
import { useCallback, useMemo } from 'preact/hooks';
import { useConfigContext } from '../../../../../core/ConfigContext';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useFetch } from '../../../../../hooks/useFetch';
import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
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
import { DisputeDetailsCustomization } from '../../types';
import { IDisputeDetail } from '../../../../../types/api/models/disputes';
import {
    DISPUTE_DATA_ACTION_BAR,
    DISPUTE_DATA_CLASS,
    DISPUTE_DATA_CONTACT_SUPPORT,
    DISPUTE_DATA_MOBILE_CLASS,
    DISPUTE_STATUS_BOX,
} from './constants';
import DisputeDataProperties from './DisputeDataProperties';

const DisputeDataAlert = ({
    status,
    isDefended,
    showContactSupport = true,
}: {
    status: IDispute['status'];
    isDefended: boolean;
    showContactSupport: boolean;
}) => {
    const { i18n } = useCoreContext();

    if ((status === 'lost' && !isDefended) || status === 'expired') {
        return <Alert type={AlertTypeOption.SUCCESS} variant={AlertVariantOption.TIP} description={i18n.get('dispute.notDefended')} />;
    }
    if (status === 'action_needed' && showContactSupport) {
        const contactSupportLabel = i18n.get('contactSupport');
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
                                    {contactSupportLabel}
                                </Link>
                            ),
                        }}
                    />
                }
            />
        );
    }
};

export const DisputeData = ({
    disputeId,
    dataCustomization,
}: {
    disputeId: string;
    dataCustomization?: { details?: DisputeDetailsCustomization };
}) => {
    const { i18n } = useCoreContext();
    const { setDispute, setFlowState } = useDisputeFlow();

    const { getDisputeDetail } = useConfigContext().endpoints;
    const isSmAndUpContainer = useResponsiveContainer(containerQueries.up.sm);

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

    const showContactSupport = dispute.defensibility === 'defendable_externally';
    const isDefendable = dispute?.defensibility === 'defendable';

    const actionButtons = useMemo(() => {
        const ctaButtons = [
            {
                title: i18n.get('disputes.accept'),
                event: onAcceptClick,
            },
        ];
        if (isDefendable)
            ctaButtons.push({
                title: i18n.get('dispute.defendDispute'),
                event: () => {},
            });
        return ctaButtons;
    }, [isDefendable]);

    return (
        <div className={cx(DISPUTE_DATA_CLASS, { [DISPUTE_DATA_MOBILE_CLASS]: !isSmAndUpContainer })}>
            <div className={DISPUTE_STATUS_BOX}>
                <StatusBox {...statusBoxOptions} tag={<DisputeStatusTag dispute={dispute} />} />
            </div>

            <DisputeDataProperties dispute={dispute} dataCustomization={dataCustomization} />

            <DisputeDataAlert
                status={dispute.status}
                isDefended={!!dispute?.latestDefense && !!dispute?.latestDefense?.defendedOn}
                showContactSupport={showContactSupport}
            />

            {dispute?.status === 'action_needed' ? (
                <div className={DISPUTE_DATA_ACTION_BAR}>
                    <ButtonActions actions={actionButtons} />
                </div>
            ) : null}
        </div>
    );
};

export default DisputeData;

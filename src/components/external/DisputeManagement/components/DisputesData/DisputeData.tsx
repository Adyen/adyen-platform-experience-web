import cx from 'classnames';
import { useCallback, useMemo } from 'preact/hooks';
import { useConfigContext } from '../../../../../core/ConfigContext';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useFetch } from '../../../../../hooks/useFetch';
import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import { IDisputeListItem } from '../../../../../types/api/models/disputes';
import { EMPTY_OBJECT, isFunction } from '../../../../../utils';
import './DisputeData.scss';
import Alert from '../../../../internal/Alert/Alert';
import { AlertTypeOption, AlertVariantOption } from '../../../../internal/Alert/types';
import ButtonActions from '../../../../internal/Button/ButtonActions/ButtonActions';
import DataOverviewDetailsSkeleton from '../../../../internal/DataOverviewDetails/DataOverviewDetailsSkeleton';
import Link from '../../../../internal/Link/Link';
import StatusBox from '../../../../internal/StatusBox/StatusBox';
import useStatusBoxData from '../../../../internal/StatusBox/useStatusBox';
import { Tag } from '../../../../internal/Tag/Tag';
import { Translation } from '../../../../internal/Translation';
import DisputeStatusTag from '../../../DisputesOverview/components/DisputesTable/DisputeStatusTag';
import { useDisputeFlow } from '../../context/dispute/context';
import { DisputeDetailsCustomization } from '../../types';
import { IDisputeDetail } from '../../../../../types/api/models/disputes';
import { DISPUTE_TYPES } from '../../../../utils/disputes/constants';
import DisputeDataProperties from './DisputeDataProperties';
import {
    DISPUTE_DATA_ACTION_BAR,
    DISPUTE_DATA_CLASS,
    DISPUTE_DATA_CONTACT_SUPPORT,
    DISPUTE_DATA_MOBILE_CLASS,
    DISPUTE_STATUS_BOX,
} from './constants';

const DisputeDataAlert = ({
    status,
    isDefended,
    showContactSupport = true,
}: {
    status: IDisputeListItem['status'];
    isDefended: boolean;
    showContactSupport: boolean;
}) => {
    const { i18n } = useCoreContext();

    if ((status === 'LOST' && !isDefended) || status === 'EXPIRED') {
        return <Alert type={AlertTypeOption.SUCCESS} variant={AlertVariantOption.TIP} description={i18n.get('disputes.notDefended')} />;
    }
    if ((status === 'UNRESPONDED' || status === 'UNDEFENDED') && showContactSupport) {
        //TODO: Change with tech writers since interpolating with another translated phrase can break meaning
        const contactSupportLabel = i18n.get('contactSupport');
        return (
            <Alert
                type={AlertTypeOption.WARNING}
                variant={AlertVariantOption.TIP}
                description={
                    <Translation
                        translationKey={'disputes.contactSupportToDefendThisDispute'}
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

    return null;
};

export const DisputeData = ({
    disputeId,
    dataCustomization,
}: {
    disputeId: string;
    dataCustomization?: { details?: DisputeDetailsCustomization };
}) => {
    const { i18n } = useCoreContext();
    const { dispute: storedDispute, setDispute, setFlowState } = useDisputeFlow();

    const { getDisputeDetail, getApplicableDefenseDocuments, acceptDispute } = useConfigContext().endpoints;

    //TODO: Also check if /defend endpoint has been returned from setup call which relates to submit button action
    const defendAuthorization = isFunction(getApplicableDefenseDocuments);
    const acceptAuthorization = isFunction(acceptDispute);
    const isSmAndUpContainer = useResponsiveContainer(containerQueries.up.sm);

    const { data, isFetching } = useFetch(
        useMemo(
            () => ({
                fetchOptions: {
                    enabled: !!disputeId && !!getDisputeDetail && !storedDispute,
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
            [storedDispute, disputeId, getDisputeDetail, setDispute]
        )
    );

    const dispute = storedDispute || data;

    const defensibility = dispute?.dispute?.defensibility;

    const statusBoxOptions = useStatusBoxData({
        timezone: dispute?.payment.balanceAccount?.timeZone,
        createdAt: dispute?.dispute.createdAt,
        amountData: dispute?.dispute.amount,
        paymentMethodData: dispute?.payment.paymentMethod,
    } as const);

    const disputeType = useMemo(() => {
        const type = dispute?.dispute.type;
        return type && i18n.get(DISPUTE_TYPES[type]);
    }, [i18n, dispute]);

    const showContactSupport = !!defensibility && ['ACCEPTABLE', 'DEFENDABLE_EXTERNALLY'].includes(defensibility);
    const isDefendable = !!defensibility && defensibility === 'DEFENDABLE' && defendAuthorization;
    const isAcceptable = !!defensibility && ['ACCEPTABLE', 'DEFENDABLE'].includes(defensibility) && acceptAuthorization;

    const onAcceptClick = useCallback(() => {
        setFlowState('accept');
    }, [setFlowState]);

    const onDefendClick = useCallback(() => {
        setFlowState('defendReasonSelectionView');
    }, [setFlowState]);

    const actionButtons = useMemo(() => {
        const ctaButtons = [];
        if (isDefendable)
            ctaButtons.push({
                title: i18n.get('disputes.defendDispute'),
                event: onDefendClick,
            });
        if (isAcceptable) {
            ctaButtons.push({
                title: i18n.get('disputes.accept'),
                event: onAcceptClick,
            });
        }
        return ctaButtons;
    }, [i18n, isAcceptable, isDefendable, onDefendClick, onAcceptClick]);

    if (!dispute || isFetching) {
        return <DataOverviewDetailsSkeleton skeletonRowNumber={5} />;
    }
    return (
        <div className={cx(DISPUTE_DATA_CLASS, { [DISPUTE_DATA_MOBILE_CLASS]: !isSmAndUpContainer })}>
            <div className={DISPUTE_STATUS_BOX}>
                <StatusBox
                    {...statusBoxOptions}
                    tag={
                        <>
                            {disputeType && <Tag label={disputeType} />}
                            {dispute?.dispute && dispute.dispute.type !== 'NOTIFICATION_OF_FRAUD' && <DisputeStatusTag dispute={dispute.dispute} />}
                        </>
                    }
                />
            </div>

            <DisputeDataProperties dispute={dispute} dataCustomization={dataCustomization} />

            <DisputeDataAlert
                status={dispute.dispute.status}
                isDefended={!!dispute?.defense && !!dispute?.defense?.defendedOn}
                showContactSupport={showContactSupport}
            />

            {isAcceptable || isDefendable ? (
                <div className={DISPUTE_DATA_ACTION_BAR}>
                    <ButtonActions actions={actionButtons} />
                </div>
            ) : null}
        </div>
    );
};

export default DisputeData;

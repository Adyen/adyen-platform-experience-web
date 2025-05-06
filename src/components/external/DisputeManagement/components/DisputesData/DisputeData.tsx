import cx from 'classnames';
import { useCallback, useMemo } from 'preact/hooks';
import { useConfigContext } from '../../../../../core/ConfigContext';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useFetch } from '../../../../../hooks/useFetch';
import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import { IDisputeDetail, IDisputeListItem } from '../../../../../types/api/models/disputes';
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
import { useDisputeFlow } from '../../hooks/useDisputeFlow';
import { DisputeDetailsCustomization } from '../../types';
import { DISPUTE_TYPES } from '../../../../utils/disputes/constants';
import DisputeDataProperties from './DisputeDataProperties';
import {
    DISPUTE_DATA_ACTION_BAR,
    DISPUTE_DATA_ALERT,
    DISPUTE_DATA_CLASS,
    DISPUTE_DATA_CONTACT_SUPPORT,
    DISPUTE_DATA_MOBILE_CLASS,
    DISPUTE_STATUS_BOX,
} from './constants';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import useTimezoneAwareDateFormatting from '../../../../../hooks/useTimezoneAwareDateFormatting';
import { DATE_FORMAT_RESPONSE_DEADLINE } from '../../../../../constants';

const DisputeDataAlert = ({
    status,
    isDefended,
    dueDate,
    timeZone,
    type,
    showContactSupport = true,
}: {
    status: IDisputeListItem['status'];
    isDefended: boolean;
    showContactSupport: boolean;
    dueDate: string | undefined;
    timeZone: string | undefined;
    type: IDisputeDetail['dispute']['type'];
}) => {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting(timeZone);

    if ((status === 'LOST' && !isDefended) || status === 'EXPIRED') {
        return <Alert type={AlertTypeOption.SUCCESS} variant={AlertVariantOption.TIP} description={i18n.get('disputes.notDefended')} />;
    }
    if ((status === 'UNRESPONDED' || status === 'UNDEFENDED' || type === 'NOTIFICATION_OF_FRAUD') && showContactSupport) {
        //TODO: Change with tech writers since interpolating with another translated phrase can break meaning
        const contactSupportLabel = i18n.get('contactSupport');
        return (
            <Alert
                type={AlertTypeOption.WARNING}
                variant={AlertVariantOption.TIP}
                description={
                    <div className={DISPUTE_DATA_ALERT}>
                        <div>
                            <Translation
                                translationKey={
                                    type === 'REQUEST_FOR_INFORMATION'
                                        ? 'disputes.contactSupportToDefendThisRequestForInformation'
                                        : type === 'NOTIFICATION_OF_FRAUD'
                                        ? 'disputes.contactSupportToResolveThisNotificationOfFraud'
                                        : 'disputes.contactSupportToDefendThisDispute'
                                }
                                fills={{
                                    contactSupport: (
                                        <Link classNames={[DISPUTE_DATA_CONTACT_SUPPORT]} withIcon={false} href={'https://www.adyen.com/'}>
                                            {contactSupportLabel}
                                        </Link>
                                    ),
                                }}
                            />
                        </div>
                        {type !== 'NOTIFICATION_OF_FRAUD' && (
                            <div>
                                <Translation
                                    translationKey={'disputes.theResponseDeadlineIs'}
                                    fills={{
                                        date: (
                                            <Typography variant={TypographyVariant.BODY} el={TypographyElement.SPAN} stronger>
                                                {dueDate ? dateFormat(dueDate, DATE_FORMAT_RESPONSE_DEADLINE) : null}
                                            </Typography>
                                        ),
                                    }}
                                />
                            </div>
                        )}
                    </div>
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
    const { setDispute, setFlowState } = useDisputeFlow();

    const { getDisputeDetail } = useConfigContext().endpoints;

    //TODO: Also check if /defend endpoint has been returned from setup call which relates to submit button action
    const defendAuthorization = isFunction(useConfigContext().endpoints.getApplicableDefenseDocuments);
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

    const onAcceptClick = useCallback(() => {
        dispute && setDispute(dispute);
        setFlowState('accept');
    }, [dispute, setDispute, setFlowState]);

    const showContactSupport =
        dispute?.dispute.defensibility === 'DEFENDABLE_EXTERNALLY' ||
        dispute?.dispute.defensibility === 'ACCEPTABLE' ||
        dispute?.dispute.type === 'NOTIFICATION_OF_FRAUD';
    const isDefendable = dispute?.dispute.defensibility === 'DEFENDABLE' && defendAuthorization;
    const isAcceptable = dispute?.dispute.defensibility === 'ACCEPTABLE' || dispute?.dispute.defensibility === 'DEFENDABLE';

    const actionButtons = useMemo(() => {
        const ctaButtons = [];
        if (isAcceptable) {
            ctaButtons.push({
                title: i18n.get('disputes.accept'),
                event: onAcceptClick,
            });
        }
        if (isDefendable)
            ctaButtons.push({
                title: i18n.get('disputes.defendDispute'),
                event: () => {},
            });
        return ctaButtons;
    }, [i18n, isAcceptable, isDefendable, onAcceptClick]);

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

            <DisputeDataAlert
                type={dispute.dispute.type}
                timeZone={dispute.payment.balanceAccount?.timeZone}
                dueDate={dispute.dispute.dueDate}
                status={dispute.dispute.status}
                isDefended={!!dispute?.defense && !!dispute?.defense?.defendedOn}
                showContactSupport={showContactSupport}
            />

            <DisputeDataProperties dispute={dispute} dataCustomization={dataCustomization} />

            {isAcceptable || isDefendable ? (
                <div className={DISPUTE_DATA_ACTION_BAR}>
                    <ButtonActions actions={actionButtons} />
                </div>
            ) : null}
        </div>
    );
};

export default DisputeData;

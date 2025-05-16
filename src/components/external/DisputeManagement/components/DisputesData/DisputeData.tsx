import cx from 'classnames';
import { useCallback, useMemo } from 'preact/hooks';
import { useConfigContext } from '../../../../../core/ConfigContext';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useFetch } from '../../../../../hooks/useFetch';
import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import { IDisputeDetail } from '../../../../../types/api/models/disputes';
import { EMPTY_OBJECT, isFunction } from '../../../../../utils';
import './DisputeData.scss';
import Alert from '../../../../internal/Alert/Alert';
import { AlertTypeOption, AlertVariantOption } from '../../../../internal/Alert/types';
import ButtonActions from '../../../../internal/Button/ButtonActions/ButtonActions';
import DataOverviewDetailsSkeleton from '../../../../internal/DataOverviewDetails/DataOverviewDetailsSkeleton';
import StatusBox from '../../../../internal/StatusBox/StatusBox';
import useStatusBoxData from '../../../../internal/StatusBox/useStatusBox';
import { Tag } from '../../../../internal/Tag/Tag';
import { Translation } from '../../../../internal/Translation';
import DisputeStatusTag from '../../../DisputesOverview/components/DisputesTable/DisputeStatusTag';
import { useDisputeFlow } from '../../context/dispute/context';
import { DisputeDetailsCustomization, DisputeManagementProps } from '../../types';
import { isDisputeActionNeeded } from '../../../../utils/disputes/actionNeeded';
import { DISPUTE_TYPES } from '../../../../utils/disputes/constants';
import { DisputeIssuerComments } from './DisputeIssuerComments';
import DisputeDataProperties from './DisputeDataProperties';
import {
    DISPUTE_DATA_ACTION_BAR,
    DISPUTE_DATA_ALERT,
    DISPUTE_DATA_CLASS,
    DISPUTE_DATA_CONTACT_SUPPORT,
    DISPUTE_DATA_ERROR_CONTAINER,
    DISPUTE_DATA_MOBILE_CLASS,
    DISPUTE_STATUS_BOX,
} from './constants';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import useTimezoneAwareDateFormatting from '../../../../../hooks/useTimezoneAwareDateFormatting';
import { DATE_FORMAT_RESPONSE_DEADLINE } from '../../../../../constants';
import Button from '../../../../internal/Button';
import { ButtonVariant } from '../../../../internal/Button/types';
import { ErrorMessageDisplay } from '../../../../internal/ErrorMessageDisplay/ErrorMessageDisplay';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import { getDisputesErrorMessage } from '../../../../utils/disputes/getDisputesErrorMessage';
type DisputeDataAlertMode = 'contactSupport' | 'notDefended';

const DisputeDataAlert = ({
    alertMode,
    onContactSupport,
    dueDate,
    timeZone,
    type,
}: {
    alertMode?: DisputeDataAlertMode;
    dueDate: string | undefined;
    timeZone: string | undefined;
    type: IDisputeDetail['dispute']['type'];
    onContactSupport?: () => void;
}) => {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting(timeZone);
    const contactSupportLabel = i18n.get('contactSupport');

    switch (alertMode) {
        case 'contactSupport':
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
                                        contactSupport: onContactSupport ? (
                                            <Button
                                                variant={ButtonVariant.TERTIARY}
                                                classNameModifiers={[DISPUTE_DATA_CONTACT_SUPPORT]}
                                                onClick={onContactSupport}
                                            >
                                                {contactSupportLabel}
                                            </Button>
                                        ) : (
                                            contactSupportLabel
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

        case 'notDefended':
            return <Alert type={AlertTypeOption.SUCCESS} variant={AlertVariantOption.TIP} description={i18n.get('disputes.notDefended')} />;
    }

    return null;
};

export const DisputeData = ({
    disputeId,
    dataCustomization,
    onContactSupport,
    onDetailsDismiss,
}: {
    disputeId: string;
    dataCustomization?: { details?: DisputeDetailsCustomization };
    onContactSupport?: () => void;
    onDetailsDismiss: DisputeManagementProps['onDetailsDismiss'];
}) => {
    const { i18n } = useCoreContext();
    const { dispute: storedDispute, setDispute, setFlowState } = useDisputeFlow();

    const { getDisputeDetail, getApplicableDefenseDocuments, acceptDispute } = useConfigContext().endpoints;

    //TODO: Also check if /defend endpoint has been returned from setup call which relates to submit button action
    const acceptAuthorization = isFunction(acceptDispute);
    const defendAuthorization = isFunction(getApplicableDefenseDocuments);
    const isSmAndUpContainer = useResponsiveContainer(containerQueries.up.sm);

    const { data, isFetching, error } = useFetch(
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
        amountData: dispute?.dispute.amount,
        paymentMethodData: dispute?.payment.paymentMethod,
    } as const);

    const issuerComments = useMemo(() => {
        const { chargeback, preArbitration } = dispute?.dispute.issuerExtraData ?? {};
        const comments = [] as string[];

        [preArbitration, chargeback].forEach(commentGroup => {
            if (!commentGroup) return;
            ['LIABILITY_NOT_ACCEPTED_FULLY', 'PRE_ARB_REASON', 'NOTE'].forEach(commentKey => {
                const raw = commentGroup[commentKey];
                const trimmed = raw?.trim();
                if (trimmed) comments.push(trimmed);
            });
        });

        return comments.filter(Boolean);
    }, [dispute]);

    const disputeType = useMemo(() => {
        const type = dispute?.dispute.type;
        return type && i18n.get(DISPUTE_TYPES[type]);
    }, [i18n, dispute]);

    const showContactSupport =
        (!!defensibility && ['ACCEPTABLE', 'DEFENDABLE_EXTERNALLY'].includes(defensibility)) || dispute?.dispute.type === 'NOTIFICATION_OF_FRAUD';
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
                title: i18n.get('disputes.defendChargeback'),
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

    const actionNeeded = useMemo(() => !!dispute && isDisputeActionNeeded(dispute.dispute), [dispute]);

    const renderBackButton = useCallback(() => {
        return (
            <Button variant={ButtonVariant.SECONDARY} onClick={onDetailsDismiss}>
                {i18n.get('disputes.goBack')}
            </Button>
        );
    }, [i18n, onDetailsDismiss]);

    if ((!dispute && !error) || isFetching) {
        return <DataOverviewDetailsSkeleton skeletonRowNumber={5} />;
    }

    const isFraudNotification = dispute?.dispute.type === 'NOTIFICATION_OF_FRAUD';
    const isDefended = !!(dispute?.defense && dispute.defense.defendedOn);

    let disputeAlertMode: DisputeDataAlertMode | undefined = undefined;

    if ((actionNeeded && showContactSupport) || (showContactSupport && isFraudNotification)) {
        disputeAlertMode = 'contactSupport';
    } else if (dispute?.dispute.status === 'EXPIRED') {
        disputeAlertMode = 'notDefended';
    } else if (dispute?.dispute.status === 'LOST' && !(isFraudNotification || isDefended)) {
        disputeAlertMode = 'notDefended';
    }

    const errorProps = getDisputesErrorMessage(error as AdyenPlatformExperienceError, 'disputes.weCouldNotLoadYourDispute', onContactSupport);

    return (
        <div className={cx(DISPUTE_DATA_CLASS, { [DISPUTE_DATA_MOBILE_CLASS]: !isSmAndUpContainer })}>
            {error ? (
                <div className={DISPUTE_DATA_ERROR_CONTAINER}>
                    <ErrorMessageDisplay
                        renderSecondaryButton={onDetailsDismiss ? renderBackButton : undefined}
                        withImage
                        outlined={false}
                        absolutePosition={false}
                        withBackground={false}
                        {...errorProps}
                    />
                </div>
            ) : dispute ? (
                <>
                    <div className={DISPUTE_STATUS_BOX}>
                        <StatusBox
                            {...statusBoxOptions}
                            tag={
                                <>
                                    {disputeType && <Tag label={disputeType} />}
                                    {!isFraudNotification && <DisputeStatusTag dispute={dispute.dispute} />}
                                </>
                            }
                        />
                    </div>

                    {issuerComments.length > 0 && <DisputeIssuerComments issuerComments={issuerComments} />}

                    {disputeAlertMode && (
                        <DisputeDataAlert
                            alertMode={disputeAlertMode}
                            onContactSupport={onContactSupport}
                            type={dispute.dispute.type}
                            timeZone={dispute.payment.balanceAccount?.timeZone}
                            dueDate={dispute.dispute.dueDate}
                        />
                    )}

                    <DisputeDataProperties dispute={dispute} dataCustomization={dataCustomization} />

                    {actionButtons.length > 0 ? (
                        <div className={DISPUTE_DATA_ACTION_BAR}>
                            <ButtonActions actions={actionButtons} />
                        </div>
                    ) : null}
                </>
            ) : null}
        </div>
    );
};

export default DisputeData;

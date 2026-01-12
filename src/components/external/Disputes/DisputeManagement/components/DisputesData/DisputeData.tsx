import cx from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { useConfigContext } from '../../../../../../core/ConfigContext';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { useFetch } from '../../../../../../hooks/useFetch';
import { containerQueries, useResponsiveContainer } from '../../../../../../hooks/useResponsiveContainer';
import { IDisputeDetail } from '../../../../../../types/api/models/disputes';
import { EMPTY_OBJECT, isFunction } from '../../../../../../utils';
import './DisputeData.scss';
import Alert from '../../../../../internal/Alert/Alert';
import { AlertTypeOption, AlertVariantOption } from '../../../../../internal/Alert/types';
import ButtonActions from '../../../../../internal/Button/ButtonActions/ButtonActions';
import { ButtonVariant } from '../../../../../internal/Button/types';
import StatusBox from '../../../../../internal/StatusBox/StatusBox';
import useStatusBoxData from '../../../../../internal/StatusBox/useStatusBox';
import { Tag } from '../../../../../internal/Tag/Tag';
import { Translation } from '../../../../../internal/Translation';
import DisputeStatusTag from '../../../DisputesOverview/components/DisputesTable/DisputeStatusTag';
import { useDisputeFlow } from '../../context/dispute/context';
import { DisputeDetailsCustomization, DisputeManagementProps } from '../../types';
import { isDisputeActionNeeded } from '../../../../../utils/disputes/actionNeeded';
import { DisputeIssuerComments } from './DisputeIssuerComments';
import DisputeDataProperties from './DisputeDataProperties';
import {
    DISPUTE_DATA_ACTION_BAR,
    DISPUTE_DATA_CLASS,
    DISPUTE_DATA_ERROR_CONTAINER,
    DISPUTE_DATA_MOBILE_CLASS,
    DISPUTE_STATUS_BOX,
    DISPUTE_DATA_STATUS_BOX_SKELETON,
    DISPUTE_DATA_SKELETON_CONTAINER,
    DISPUTE_DATA_STATUS_BOX_STATUS,
    DISPUTE_DATA_STATUS_BOX_AMOUNT,
    DISPUTE_DATA_STATUS_BOX_PAYMENT_METHOD,
    DISPUTE_DATA_STATUS_BOX_STATUS_CONTAINER,
    DISPUTE_DATA_STATUS_BOX_PAYMENT_METHOD_CONTAINER,
    DISPUTE_DATA_PROPERTIES_SKELETON,
    DISPUTE_DATA_PROPERTIES_SKELETON_CONTAINER,
    DISPUTE_DATA_PROPERTIES_SKELETON_ELEMENT,
} from './constants';
import Button from '../../../../../internal/Button';
import Typography from '../../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../../internal/Typography/types';
import useTimezoneAwareDateFormatting from '../../../../../../hooks/useTimezoneAwareDateFormatting';
import { DATE_FORMAT_RESPONSE_DEADLINE } from '../../../../../../constants';
import { getDisputeType } from '../../../../../utils/translation/getters';
import { ErrorMessageDisplay } from '../../../../../internal/ErrorMessageDisplay/ErrorMessageDisplay';
import AdyenPlatformExperienceError from '../../../../../../core/Errors/AdyenPlatformExperienceError';
import { getDisputesErrorMessage } from '../../../../../utils/disputes/getDisputesErrorMessage';
import { CustomButtonObject } from '../../../../../types';

type DisputeDataAlertMode = 'contactSupport' | 'autoDefended' | 'notDefended' | 'notDefendable';

const _isButtonType = (item: any): item is CustomButtonObject => {
    return !!item && typeof item === 'object' && item.type === 'button';
};
const DisputeDataAlert = ({
    alertMode,
    dispute,
    timeZone,
}: {
    alertMode?: DisputeDataAlertMode;
    dispute: IDisputeDetail['dispute'];
    timeZone: string | undefined;
}) => {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting(timeZone);

    switch (alertMode) {
        case 'contactSupport': {
            const { dueDate, type } = dispute;
            const translationKey =
                type === 'REQUEST_FOR_INFORMATION'
                    ? 'disputes.management.details.alerts.contactSupport.requestForInformation'
                    : type === 'NOTIFICATION_OF_FRAUD'
                      ? 'disputes.management.details.alerts.contactSupport.notificationOfFraud'
                      : 'disputes.management.details.alerts.contactSupport.chargeback';

            return (
                <Alert
                    type={AlertTypeOption.WARNING}
                    variant={AlertVariantOption.TIP}
                    description={
                        <>
                            {i18n.get(translationKey)}
                            {type !== 'NOTIFICATION_OF_FRAUD' && !!dueDate && (
                                <>
                                    {' '}
                                    <Translation
                                        translationKey={'disputes.management.details.alerts.responseDeadline'}
                                        fills={{
                                            date: (
                                                <time dateTime={dueDate}>
                                                    <Typography variant={TypographyVariant.CAPTION} el={TypographyElement.SPAN} stronger>
                                                        {dateFormat(dueDate, DATE_FORMAT_RESPONSE_DEADLINE)}
                                                    </Typography>
                                                </time>
                                            ),
                                        }}
                                    />
                                </>
                            )}
                        </>
                    }
                />
            );
        }
        case 'autoDefended':
            return (
                <Alert
                    type={AlertTypeOption.HIGHLIGHT}
                    variant={AlertVariantOption.TIP}
                    description={i18n.get('disputes.management.details.alerts.autoDefended')}
                />
            );
        case 'notDefended': {
            const translationKey =
                dispute.status === 'EXPIRED'
                    ? 'disputes.management.details.alerts.notDefendedExpired'
                    : 'disputes.management.details.alerts.notDefendedLost';
            return <Alert type={AlertTypeOption.HIGHLIGHT} variant={AlertVariantOption.TIP} description={i18n.get(translationKey)} />;
        }
        case 'notDefendable':
            return (
                <Alert
                    type={AlertTypeOption.HIGHLIGHT}
                    variant={AlertVariantOption.TIP}
                    description={i18n.get('disputes.management.details.alerts.notDefendable')}
                />
            );
    }

    return null;
};

export const DisputeData = ({
    disputeId,
    dataCustomization,
    onContactSupport,
    onDismiss,
}: {
    disputeId: string;
    dataCustomization?: { details?: DisputeDetailsCustomization };
    onContactSupport?: () => void;
    onDismiss: DisputeManagementProps['onDismiss'];
}) => {
    const { i18n } = useCoreContext();
    const { dispute: storedDispute, setDispute, setFlowState, defenseReasonConfig } = useDisputeFlow();

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

    const disputeType = useMemo(() => getDisputeType(i18n, dispute?.dispute.type), [i18n, dispute]);

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

    const [extraButtons, setExtraButtons] = useState<CustomButtonObject[]>([]);

    const getCustomButtons = useCallback(async () => {
        const customData = data && (await dataCustomization?.details?.onDataRetrieve?.(data));
        if (customData) {
            return setExtraButtons(
                Object.values(customData).filter(config => {
                    return _isButtonType(config);
                }) as CustomButtonObject[]
            );
        }
    }, [data, dataCustomization?.details]);

    useEffect(() => {
        void getCustomButtons();
    }, [getCustomButtons]);

    const defendButtonLabel = useMemo(() => {
        return storedDispute?.dispute.type === 'REQUEST_FOR_INFORMATION'
            ? i18n.get('disputes.management.details.actions.submitInformation')
            : i18n.get('disputes.management.details.actions.defendChargeback');
    }, [i18n, storedDispute?.dispute.type]);

    const actionButtons = useMemo(() => {
        const ctaButtons = [];
        if (isDefendable)
            ctaButtons.push({
                title: defendButtonLabel,
                event: onDefendClick,
            });
        if (isAcceptable) {
            ctaButtons.push({
                title: i18n.get('disputes.management.details.actions.accept'),
                event: onAcceptClick,
                variant: ButtonVariant.SECONDARY,
            });
        }
        if (showContactSupport && isFunction(onContactSupport)) {
            ctaButtons.push({
                title: i18n.get('disputes.management.details.actions.contactSupport'),
                event: onContactSupport,
                variant: ButtonVariant.SECONDARY,
            });
        }

        if (extraButtons && extraButtons.length) {
            extraButtons.forEach((config: CustomButtonObject) => {
                ctaButtons.push({
                    title: config?.value,
                    event: config?.config?.action,
                    variant: ButtonVariant.SECONDARY,
                });
            });
        }
        return ctaButtons;
    }, [isDefendable, defendButtonLabel, onDefendClick, isAcceptable, showContactSupport, onContactSupport, extraButtons, i18n, onAcceptClick]);

    const actionNeeded = useMemo(() => !!dispute && isDisputeActionNeeded(dispute.dispute), [dispute]);

    const renderBackButton = useCallback(() => {
        return (
            <Button variant={ButtonVariant.SECONDARY} onClick={onDismiss}>
                {i18n.get('disputes.management.common.actions.goBack')}
            </Button>
        );
    }, [i18n, onDismiss]);

    if ((!dispute && !error) || isFetching) {
        const skeletonRows = Array.from({ length: 5 });

        return (
            <div className={cx(DISPUTE_DATA_CLASS, { [DISPUTE_DATA_MOBILE_CLASS]: !isSmAndUpContainer })}>
                <div className={DISPUTE_DATA_SKELETON_CONTAINER}>
                    <div className={DISPUTE_DATA_STATUS_BOX_SKELETON}>
                        <div className={DISPUTE_DATA_STATUS_BOX_STATUS_CONTAINER}>
                            <span className={DISPUTE_DATA_STATUS_BOX_STATUS}></span>
                            <span className={DISPUTE_DATA_STATUS_BOX_STATUS}></span>
                        </div>
                        <span className={DISPUTE_DATA_STATUS_BOX_AMOUNT}></span>
                        <div className={DISPUTE_DATA_STATUS_BOX_PAYMENT_METHOD_CONTAINER}>
                            <span className={DISPUTE_DATA_STATUS_BOX_PAYMENT_METHOD}></span>
                            <span className={DISPUTE_DATA_STATUS_BOX_PAYMENT_METHOD}></span>
                        </div>
                    </div>
                    <div className={DISPUTE_DATA_PROPERTIES_SKELETON_CONTAINER}>
                        {skeletonRows.map((_, index) => (
                            <div className={DISPUTE_DATA_PROPERTIES_SKELETON} key={`skeleton-${index}`}>
                                <span className={DISPUTE_DATA_PROPERTIES_SKELETON_ELEMENT} />
                                <span className={DISPUTE_DATA_PROPERTIES_SKELETON_ELEMENT} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const isFraudNotification = dispute?.dispute.type === 'NOTIFICATION_OF_FRAUD';
    const isDefended = !!(dispute?.defense && dispute.defense.defendedOn);

    let disputeAlertMode: DisputeDataAlertMode | undefined = undefined;

    if (dispute?.defense?.autodefended === true) {
        disputeAlertMode = 'autoDefended';
    } else if (actionNeeded && defensibility === 'NOT_ACTIONABLE') {
        disputeAlertMode = 'notDefendable';
    } else if ((actionNeeded && showContactSupport) || (showContactSupport && isFraudNotification)) {
        disputeAlertMode = 'contactSupport';
    } else if (dispute?.dispute.status === 'EXPIRED') {
        disputeAlertMode = 'notDefended';
    } else if (dispute?.dispute.status === 'LOST' && !(isFraudNotification || isDefended)) {
        disputeAlertMode = 'notDefended';
    }

    const errorProps = getDisputesErrorMessage(
        error as AdyenPlatformExperienceError,
        'disputes.management.common.errors.unavailable',
        onContactSupport
    );

    return (
        <div className={cx(DISPUTE_DATA_CLASS, { [DISPUTE_DATA_MOBILE_CLASS]: !isSmAndUpContainer })}>
            {error ? (
                <div className={DISPUTE_DATA_ERROR_CONTAINER}>
                    <ErrorMessageDisplay
                        renderSecondaryButton={onDismiss ? renderBackButton : undefined}
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
                            dispute={dispute.dispute}
                            timeZone={dispute.payment.balanceAccount?.timeZone}
                        />
                    )}

                    <DisputeDataProperties dispute={dispute} dataCustomization={dataCustomization} defenseReasonConfig={defenseReasonConfig} />

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

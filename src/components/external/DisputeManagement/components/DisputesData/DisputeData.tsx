import cx from 'classnames';
import { useCallback, useMemo, useState } from 'preact/hooks';
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
import Link from '../../../../internal/Link/Link';
import StatusBox from '../../../../internal/StatusBox/StatusBox';
import useStatusBoxData from '../../../../internal/StatusBox/useStatusBox';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import { Tag } from '../../../../internal/Tag/Tag';
import { Translation } from '../../../../internal/Translation';
import DisputeStatusTag from '../../../DisputesOverview/components/DisputesTable/DisputeStatusTag';
import { useDisputeFlow } from '../../hooks/useDisputeFlow';
import { DisputeDetailsCustomization } from '../../types';
import { isDisputeActionNeeded } from '../../../../utils/disputes/actionNeeded';
import { DISPUTE_TYPES } from '../../../../utils/disputes/constants';
import DisputeDataProperties from './DisputeDataProperties';
import {
    DISPUTE_DATA_ACTION_BAR,
    DISPUTE_DATA_CLASS,
    DISPUTE_DATA_CONTACT_SUPPORT,
    DISPUTE_DATA_ISSUER_COMMENT,
    DISPUTE_DATA_MOBILE_CLASS,
    DISPUTE_STATUS_BOX,
} from './constants';
import Button from '../../../../internal/Button';
import { ButtonVariant } from '../../../../internal/Button/types';

type DisputeDataAlertMode = 'contactSupport' | 'notDefended';

const DisputeDataAlert = ({ alertMode }: { alertMode?: DisputeDataAlertMode | undefined }) => {
    const { i18n } = useCoreContext();
    switch (alertMode) {
        case 'contactSupport':
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
                                        {/* TODO: Change with tech writers since interpolating with another translated phrase can break meaning */}
                                        {i18n.get('contactSupport')}
                                    </Link>
                                ),
                            }}
                        />
                    }
                />
            );

        case 'notDefended':
            return <Alert type={AlertTypeOption.SUCCESS} variant={AlertVariantOption.TIP} description={i18n.get('disputes.notDefended')} />;
    }

    return null;
};

const DisputeIssuerComment = ({ issuerComment }: { issuerComment: string }) => {
    const { i18n } = useCoreContext();
    const [isExpanded, setIsExpanded] = useState(false);
    const [textClipped, setTextClipped] = useState(false);
    return (
        <Alert
            type={AlertTypeOption.HIGHLIGHT}
            variant={AlertVariantOption.TIP}
            description={
                <div className={DISPUTE_DATA_ISSUER_COMMENT}>
                    <Typography el={TypographyElement.DIV} variant={TypographyVariant.BODY} strongest>
                        {i18n.get('disputes.issuerComment.title')}
                    </Typography>
                    <div>
                        <Typography el={TypographyElement.PARAGRAPH} variant={TypographyVariant.BODY}>
                            {/* [NOTE]: Issuer comment not translated at the moment (maybe never) */}
                            {'"'}
                            {issuerComment}
                            {'"'}
                        </Typography>
                    </div>
                    {textClipped && (
                        <Button variant={ButtonVariant.TERTIARY} onClick={() => setIsExpanded(isExpanded => !isExpanded)}>
                            {i18n.get(isExpanded ? 'disputes.issuerComment.showLess' : 'disputes.issuerComment.showMore')}
                        </Button>
                    )}
                </div>
            }
        />
    );
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
        amountData: dispute?.dispute.amount,
        paymentMethodData: dispute?.payment.paymentMethod,
    } as const);

    const issuerComment = useMemo(() => dispute?.dispute.issuerComment?.trim(), [dispute]);

    const disputeType = useMemo(() => {
        const type = dispute?.dispute.type;
        return type && i18n.get(DISPUTE_TYPES[type]);
    }, [i18n, dispute]);

    const onAcceptClick = useCallback(() => {
        dispute && setDispute(dispute);
        setFlowState('accept');
    }, [dispute, setDispute, setFlowState]);

    const actionNeeded = useMemo(() => !!dispute && isDisputeActionNeeded(dispute.dispute), [dispute]);
    const isFraudNotification = dispute?.dispute.type === 'NOTIFICATION_OF_FRAUD';
    const isDefended = !!(dispute?.defense && dispute.defense.defendedOn);

    const defensibility = dispute?.dispute.defensibility;

    const showContactSupport = defensibility === 'DEFENDABLE_EXTERNALLY' || defensibility === 'ACCEPTABLE';
    const isDefendable = defensibility === 'DEFENDABLE' && defendAuthorization;
    const isAcceptable = defensibility === 'ACCEPTABLE' || defensibility === 'DEFENDABLE';

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

    let disputeAlertMode: DisputeDataAlertMode | undefined = undefined;

    if (actionNeeded && showContactSupport) {
        disputeAlertMode = 'contactSupport';
    } else if (dispute.dispute.status === 'EXPIRED') {
        disputeAlertMode = 'notDefended';
    } else if (dispute.dispute.status === 'LOST' && !(isFraudNotification || isDefended)) {
        disputeAlertMode = 'notDefended';
    }

    return (
        <div className={cx(DISPUTE_DATA_CLASS, { [DISPUTE_DATA_MOBILE_CLASS]: !isSmAndUpContainer })}>
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

            {issuerComment && <DisputeIssuerComment issuerComment={issuerComment} />}

            <DisputeDataProperties dispute={dispute} dataCustomization={dataCustomization} />
            <DisputeDataAlert alertMode={disputeAlertMode} />

            {isAcceptable || isDefendable ? (
                <div className={DISPUTE_DATA_ACTION_BAR}>
                    <ButtonActions actions={actionButtons} />
                </div>
            ) : null}
        </div>
    );
};

export default DisputeData;

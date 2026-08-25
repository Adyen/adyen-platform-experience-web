import { IGrant } from '@integration-components/types';
import { useCoreContext, useEventDispatcherContext } from '@integration-components/core/preact';
import { useLandedPageEvent } from '@integration-components/hooks-preact/useEventDispatcher/useLandedPageEvent';
import { BaseList } from '@integration-components/ui-components-preact/BaseList/BaseList';
import { GrantItem } from '../GrantItem/GrantItem';
import { FunctionalComponent } from 'preact';
import { GRANT_ADJUSTMENT_DETAILS } from '../GrantAdjustmentDetails/constants';
import { GrantAdjustmentDetail, GrantAdjustmentDetailCallback } from '../GrantAdjustmentDetails/types';
import { GrantRepaymentDetails } from '../GrantRepaymentDetails/GrantRepaymentDetails';
import { sharedCapitalOverviewAnalyticsEventProperties } from '../../../../../domain/src/CapitalOverview/constants';
import SegmentedControl from '@integration-components/ui-components-preact/SegmentedControl/SegmentedControl';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { CapitalHeader } from '../../../internal/CapitalHeader';
import Button from '@integration-components/ui-components-preact/Button/Button';
import Typography from '@integration-components/ui-components-preact/Typography/Typography';
import { TypographyVariant } from '@integration-components/ui-components-preact/Typography/types';
import InfoBox from '@integration-components/ui-components-preact/InfoBox';
import { EnhancedCapitalState, getHasGrantGroups, getGroupedGrants, getGrantConfig } from '@integration-components/capital/domain';

const sharedAnalyticsEventProperties = {
    ...sharedCapitalOverviewAnalyticsEventProperties,
    subCategory: 'Grants overview',
} as const;

const List = ({ grants, showDetails }: { grants: IGrant[]; showDetails: GrantAdjustmentDetailCallback }) => {
    return (
        <BaseList classNames={'adyen-pe-grant-list__items'}>
            {grants.map(grant => (
                <li key={grant.id}>
                    <GrantItem grant={grant} showDetails={showDetails.bind(null, grant)} />
                </li>
            ))}
        </BaseList>
    );
};

interface GrantsDisplayProps {
    capitalState: EnhancedCapitalState;
    grants: IGrant[];
    hideTitle?: boolean;
    onNewOfferRequest: () => void;
}

export const GrantsDisplay: FunctionalComponent<GrantsDisplayProps> = ({ capitalState, grants, hideTitle, onNewOfferRequest }) => {
    const [selectedGrantDetail, setSelectedGrantDetail] = useState<GrantAdjustmentDetail>();
    const [selectedGrant, setSelectedGrant] = useState<IGrant>();
    const { i18n } = useCoreContext();

    const userEvents = useEventDispatcherContext();

    const grantGroups = useMemo(() => getGroupedGrants(grants), [grants]);
    const hasGrantGroups = useMemo(() => getHasGrantGroups(grantGroups), [grantGroups]);

    const maxAmount = useMemo(() => capitalState.dynamicOffer?.maxAmount, [capitalState.dynamicOffer?.maxAmount]);

    const onNewOfferRequestWithTracking = useCallback<typeof onNewOfferRequest>(() => {
        try {
            return onNewOfferRequest();
        } finally {
            userEvents.addEvent?.('Clicked button', { ...sharedAnalyticsEventProperties, label: 'Request a new loan' });
        }
    }, [onNewOfferRequest, userEvents]);

    const selectedGrantConfig = useMemo(() => selectedGrant && getGrantConfig(selectedGrant), [selectedGrant]);

    const hideGrantDetails = useCallback(() => setSelectedGrantDetail(undefined), []);

    const showGrantDetails = useCallback<GrantAdjustmentDetailCallback>((grant, detail) => {
        setSelectedGrantDetail(detail);
        setSelectedGrant(grant);
    }, []);

    useLandedPageEvent({ ...sharedAnalyticsEventProperties, label: 'Capital overview' });

    if (
        selectedGrant &&
        selectedGrantDetail === GRANT_ADJUSTMENT_DETAILS.unscheduledRepayment &&
        selectedGrantConfig?.hasUnscheduledRepaymentDetails
    ) {
        return <GrantRepaymentDetails grant={selectedGrant} onDetailsClose={hideGrantDetails} />;
    }

    return (
        <div className="adyen-pe-grant-list">
            <CapitalHeader hideTitle={hideTitle} region={capitalState.region} titleKey={'capital.common.title'} />

            {capitalState.dynamicOffer && maxAmount ? (
                <InfoBox className="adyen-pe-grant-list__new-grant-banner">
                    <Typography variant={TypographyVariant.BODY}>
                        {i18n.get('capital.overview.grants.newGrant.title.part1')}
                        <strong>
                            {i18n.get('capital.overview.grants.newGrant.title.part2', {
                                values: {
                                    amount: i18n.amount(maxAmount.value, maxAmount.currency, {
                                        minimumFractionDigits: 0,
                                    }),
                                },
                            })}
                        </strong>
                    </Typography>

                    {!!capitalState.renewableGrants.length && (
                        <Typography variant={TypographyVariant.CAPTION} className="adyen-pe-grant-list__early-renewal-notice">
                            {i18n.get('capital.overview.grants.newGrant.earlyRenewalNotice')}
                        </Typography>
                    )}

                    <Button onClick={onNewOfferRequestWithTracking} className={'adyen-pe-grant-list__offer-button'} align="center">
                        {i18n.get('capital.overview.grants.newGrant.actions.newGrant')}
                    </Button>
                </InfoBox>
            ) : null}

            {hasGrantGroups ? (
                <SegmentedControl
                    items={[
                        {
                            label: 'capital.overview.grants.list.tabs.labels.inProgress',
                            content: <List grants={grantGroups.ongoing} showDetails={showGrantDetails} />,
                            id: 'active',
                        },
                        {
                            label: 'capital.overview.grants.list.tabs.labels.closed',
                            content: <List grants={grantGroups.closed} showDetails={showGrantDetails} />,
                            id: 'inactive',
                        },
                    ]}
                    activeItem={'active'}
                    aria-label={i18n.get('capital.overview.grants.list.tabs.a11y.label')}
                />
            ) : (
                <List grants={grants} showDetails={showGrantDetails} />
            )}
        </div>
    );
};

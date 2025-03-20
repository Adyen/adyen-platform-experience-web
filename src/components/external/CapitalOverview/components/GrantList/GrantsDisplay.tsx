import { IGrant } from '../../../../../types';
import { BaseList } from '../../../../internal/BaseList/BaseList';
import { GrantItem } from '../GrantItem/GrantItem';
import { getGrantConfig } from '../GrantItem/utils';
import { FunctionalComponent } from 'preact';
import { GrantsProps } from './types';
import { GRANT_ADJUSTMENT_DETAILS } from '../GrantAdjustmentDetails/constants';
import { GrantAdjustmentDetail, GrantAdjustmentDetailCallback } from '../GrantAdjustmentDetails/types';
import { GrantRepaymentDetails } from '../GrantRepaymentDetails/GrantRepaymentDetails';
import SegmentedControl from '../../../../internal/SegmentedControl/SegmentedControl';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { CapitalHeader } from '../../../../internal/CapitalHeader';
import Button from '../../../../internal/Button/Button';
import { ButtonVariant } from '../../../../internal/Button/types';

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

export const GrantsDisplay: FunctionalComponent<GrantsProps> = ({ grantList, hideTitle, newOfferAvailable, onNewOfferRequest }) => {
    const [selectedGrantDetail, setSelectedGrantDetail] = useState<GrantAdjustmentDetail>();
    const [selectedGrant, setSelectedGrant] = useState<IGrant>();
    const { i18n } = useCoreContext();

    const [activeGrants, inactiveGrants] = useMemo(() => {
        const active: IGrant[] = [];
        const inactive: IGrant[] = [];

        grantList?.forEach(grant => {
            if (grant.status === 'Active' || grant.status === 'Pending') {
                active.push(grant);
            } else {
                inactive.push(grant);
            }
        });

        return [active, inactive];
    }, [grantList]);

    const displayMode = useMemo<'UnifiedGrants' | 'SegmentedGrants'>(() => {
        if (grantList.length > 1 && activeGrants.length && inactiveGrants.length) return 'SegmentedGrants';
        return 'UnifiedGrants';
    }, [activeGrants.length, grantList.length, inactiveGrants.length]);

    const showNewOfferButton = useMemo(() => {
        return newOfferAvailable && !activeGrants.some(grant => grant.status === 'Pending');
    }, [activeGrants, newOfferAvailable]);

    const selectedGrantConfig = useMemo(() => selectedGrant && getGrantConfig(selectedGrant), [selectedGrant]);

    const hideGrantDetails = useCallback(() => setSelectedGrantDetail(undefined), []);

    const showGrantDetails = useCallback<GrantAdjustmentDetailCallback>((grant, detail) => {
        setSelectedGrantDetail(detail);
        setSelectedGrant(grant);
    }, []);

    if (selectedGrant) {
        switch (selectedGrantDetail) {
            case GRANT_ADJUSTMENT_DETAILS.unscheduledRepayment: {
                if (selectedGrantConfig?.hasUnscheduledRepaymentDetails) {
                    return <GrantRepaymentDetails grant={selectedGrant} onDetailsClose={hideGrantDetails} />;
                }
                break;
            }

            // The grant revocation account details is currently not ready to be rendered.
            // A future iteration of this component might include revocation account details.
            // Only then should the following lines be uncommented.
            //
            // case GRANT_DETAILS_VIEWS.revocation:
            //     if (selectedGrantConfig?.hasRevocationDetails) {
            //         return <GrantRevocationDetails grant={selectedGrant} onDetailsClose={hideGrantDetailsView} />;
            //     }
            //     break;
        }
    }

    return (
        <div className="adyen-pe-grant-list">
            <div className="adyen-pe-grant-list__header-container">
                <CapitalHeader hideTitle={hideTitle} titleKey={'capital.businessFinancing'} />
                {showNewOfferButton ? (
                    <Button onClick={onNewOfferRequest} className={'adyen-pe-grant-list__offer-button'} variant={ButtonVariant.SECONDARY}>
                        {i18n.get('capital.seeNewOffer')}
                    </Button>
                ) : null}
            </div>

            {displayMode === 'UnifiedGrants' && <List grants={grantList} showDetails={showGrantDetails} />}
            {displayMode === 'SegmentedGrants' && (
                <SegmentedControl
                    items={[
                        {
                            label: 'capital.inProgress',
                            content: <List grants={activeGrants} showDetails={showGrantDetails} />,
                            id: 'active',
                        },
                        {
                            label: 'capital.closed',
                            content: <List grants={inactiveGrants} showDetails={showGrantDetails} />,
                            id: 'inactive',
                        },
                    ]}
                    defaultItem={'active'}
                />
            )}
        </div>
    );
};

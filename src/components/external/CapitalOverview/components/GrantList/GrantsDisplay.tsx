import { IGrant } from '../../../../../types';
import { BaseList } from '../../../../internal/BaseList/BaseList';
import { GrantAccountDisplay } from './GrantAccountDisplay';
import { GrantItem } from '../GrantItem/GrantItem';
import { FunctionalComponent } from 'preact';
import { GrantDetailsView } from './constants';
import { GrantDetailsViewCallback, GrantDetailsViewType, GrantsProps } from './types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { CapitalHeader } from '../../../../internal/CapitalHeader';
import Button from '../../../../internal/Button/Button';
import { ButtonVariant } from '../../../../internal/Button/types';
import Tabs from '../../../../internal/Tabs/Tabs';

const List = ({ grants, showDetailsView }: { grants: IGrant[]; showDetailsView: GrantDetailsViewCallback }) => {
    return (
        <BaseList classNames={'adyen-pe-grant-list__items'}>
            {grants.map(grant => (
                <li key={grant.id}>
                    <GrantItem grant={grant} showDetailsView={showDetailsView.bind(null, grant)} />
                </li>
            ))}
        </BaseList>
    );
};

export const GrantsDisplay: FunctionalComponent<GrantsProps> = ({ grantList, hideTitle, newOfferAvailable, onNewOfferRequest }) => {
    const [selectedGrantDetailsView, setSelectedGrantDetailsView] = useState<GrantDetailsViewType>();
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

    const displayMode = useMemo<'SingleGrant' | 'Tabs'>(() => {
        if (grantList.length > 1 && activeGrants.length && inactiveGrants.length) return 'Tabs';
        return 'SingleGrant';
    }, [activeGrants.length, grantList.length, inactiveGrants.length]);

    const showNewOfferButton = useMemo(() => {
        return newOfferAvailable && !activeGrants.some(grant => grant.status === 'Pending');
    }, [activeGrants, newOfferAvailable]);

    const hideGrantDetailsView = useCallback(() => setSelectedGrantDetailsView(undefined), []);

    const showGrantDetailsView = useCallback<GrantDetailsViewCallback>((grant, detailsView = GrantDetailsView.DEFAULT) => {
        setSelectedGrantDetailsView(detailsView);
        setSelectedGrant(grant);
    }, []);

    if (selectedGrant) {
        switch (selectedGrantDetailsView) {
            case GrantDetailsView.EARLY_REPAYMENT:
                // case GrantDetailsView.REVOCATION:
                return <GrantAccountDisplay detailsView={selectedGrantDetailsView} grant={selectedGrant} onDisplayClose={hideGrantDetailsView} />;
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

            {displayMode === 'SingleGrant' && <List grants={grantList} showDetailsView={showGrantDetailsView} />}
            {displayMode === 'Tabs' && (
                <Tabs
                    tabs={[
                        {
                            label: 'capital.inProgress',
                            content: <List grants={activeGrants} showDetailsView={showGrantDetailsView} />,
                            id: 'active',
                        },
                        {
                            label: 'capital.closed',
                            content: <List grants={inactiveGrants} showDetailsView={showGrantDetailsView} />,
                            id: 'inactive',
                        },
                    ]}
                    defaultActiveTab={'active'}
                />
            )}
        </div>
    );
};

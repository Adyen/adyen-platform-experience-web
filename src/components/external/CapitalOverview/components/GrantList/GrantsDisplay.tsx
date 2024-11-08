import { IGrant } from '../../../../../types';
import { BaseList } from '../../../../internal/BaseList/BaseList';
import { GrantItem } from '../GrantItem/GrantItem';
import { FunctionalComponent } from 'preact';
import { GrantsProps } from './types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useMemo } from 'preact/hooks';
import { CapitalHeader } from '../../../../internal/CapitalHeader';
import Button from '../../../../internal/Button/Button';
import { ButtonVariant } from '../../../../internal/Button/types';
import Tabs from '../../../../internal/Tabs/Tabs';

const List = ({ grants }: { grants: IGrant[] }) => {
    return (
        <BaseList classNames={'adyen-pe-grant-list__items'}>
            {grants.map(grant => (
                <li key={grant.id}>
                    <GrantItem grant={grant} />
                </li>
            ))}
        </BaseList>
    );
};

export const GrantsDisplay: FunctionalComponent<GrantsProps> = ({ grantList, hideTitle, newOfferAvailable, onNewOfferRequest }) => {
    const { i18n } = useCoreContext();

    const [activeGrants, inactiveGrants] = useMemo(() => {
        const active: IGrant[] = [];
        const inactive: IGrant[] = [];

        grantList?.forEach(grant => {
            if (grant.status === 'Active') {
                active.push(grant);
            } else {
                inactive.push(grant);
            }
        });

        return [active, inactive];
    }, [grantList]);

    const displayMode = useMemo<'SingleGrant' | 'Tabs' | undefined>(() => {
        if (grantList.length === 1) return 'SingleGrant';
        if (grantList.length > 1) return 'Tabs';
    }, [grantList.length]);

    return (
        <div className="adyen-pe-grant-list">
            <div className="adyen-pe-grant-list__header-container">
                <CapitalHeader hideTitle={hideTitle} titleKey={'capital.businessFinancing'} />
                {newOfferAvailable ? (
                    <Button onClick={onNewOfferRequest} className={'adyen-pe-grant-list__offer-button'} variant={ButtonVariant.SECONDARY}>
                        {i18n.get('capital.seeNewOffer')}
                    </Button>
                ) : null}
            </div>

            {displayMode === 'SingleGrant' && <List grants={grantList} />}
            {displayMode === 'Tabs' && (
                <Tabs
                    tabs={[
                        {
                            label: 'capital.active',
                            content: <List grants={activeGrants} />,
                            id: 'active',
                        },
                        {
                            label: 'capital.inactive',
                            content: <List grants={inactiveGrants} />,
                            id: 'inactive',
                        },
                    ]}
                    defaultActiveTab={'active'}
                />
            )}
        </div>
    );
};

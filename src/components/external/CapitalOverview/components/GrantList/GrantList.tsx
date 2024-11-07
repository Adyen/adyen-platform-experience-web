import { FunctionalComponent } from 'preact';
import { GrantListProps } from './types';
import { CapitalHeader } from '../../../../internal/CapitalHeader';
import { BaseList } from '../../../../internal/BaseList/BaseList';
import { GrantItem } from '../GrantItem/GrantItem';
import Button from '../../../../internal/Button';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { ButtonVariant } from '../../../../internal/Button/types';
import './GrantList.scss';
import Tabs from '../../../../internal/Tabs/Tabs';
import { useMemo } from 'preact/hooks';
import { IGrant } from '../../../../../types';

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

export const GrantList: FunctionalComponent<GrantListProps> = ({ grantList, hideTitle, newOfferAvailable }) => {
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

    const display = useMemo<'SingleGrant' | 'Tabs' | undefined>(() => {
        if (grantList.length === 1) return 'SingleGrant';
        if (grantList.length > 1) return 'Tabs';
    }, [grantList.length]);

    return (
        <div className="adyen-pe-grant-list">
            <div className="adyen-pe-grant-list__header-container">
                <CapitalHeader hideTitle={hideTitle} titleKey={'capital.businessFinancing'} />
                {newOfferAvailable ? (
                    <Button className={'adyen-pe-grant-list__offer-button'} variant={ButtonVariant.SECONDARY}>
                        {i18n.get('capital.seeNewOffer')}
                    </Button>
                ) : null}
            </div>

            {display === 'SingleGrant' && <List grants={grantList} />}
            {display === 'Tabs' && (
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

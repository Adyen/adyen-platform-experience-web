import { FunctionalComponent } from 'preact';
import { GrantListProps } from './types';
import { CapitalHeader } from '../../../../internal/CapitalHeader';
import { BaseList } from '../../../../internal/BaseList/BaseList';
import { GrantItem } from '../GrantItem/GrantItem';
import Button from '../../../../internal/Button';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { ButtonVariant } from '../../../../internal/Button/types';
import './GrantList.scss';

export const GrantList: FunctionalComponent<GrantListProps> = ({ grantList, hideTitle, newOfferAvailable }) => {
    const { i18n } = useCoreContext();

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

            <BaseList classNames={'adyen-pe-grant-list__items'}>
                {grantList?.map(grant => (
                    <li key={grant.id}>
                        <GrantItem grant={grant} />
                    </li>
                ))}
            </BaseList>
        </div>
    );
};

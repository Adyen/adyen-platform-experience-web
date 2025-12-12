import { SecondaryNav } from '../../../../../internal/SecondaryNav';
import { _UIComponentProps, PayByLinkSettingsComponentProps } from '../../../../../types';
import { CONTAINER_CLASS_NAME, SIDEBAR_CONTAINER_CLASS_NAME, SECONDARY_NAV_CLASS_NAME, CONTENT_CONTAINER_CLASS_NAME } from './constants';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { Divider } from '../../../../../internal/Divider/Divider';
import './PayByLinkSettingsContainer.scss';
import { StoreSelector } from '../../../../../internal/StoreSelector';
import { useStores } from '../../../../../../hooks/useStores';
import { Header } from '../../../../../internal/Header';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { TranslationKey } from '../../../../../../translations';
import PayByLinkSettingsContent from './PayByLinkSettingsContent';

export const ActiveMenuItem = {
    theme: 'theme',
    termsAndConditions: 'termsAndConditions',
};

const MENU_ITEMS = [
    { value: ActiveMenuItem.theme, label: 'payByLink.settings.navigation.theme' },
    { value: ActiveMenuItem.termsAndConditions, label: 'payByLink.settings.navigation.termsAndConditions' },
] as { value: string; label: TranslationKey }[];

const PayByLinkSettingsContainer = (props: _UIComponentProps<PayByLinkSettingsComponentProps>) => {
    const { i18n } = useCoreContext();

    const [activeMenuItem, setActiveMenuItem] = useState<string>(MENU_ITEMS[0]?.value || '');
    const { stores, selectedStore, setSelectedStore } = useStores();

    useEffect(() => {
        if (!selectedStore) setSelectedStore(stores?.[0]?.id);
    }, [stores, selectedStore, setSelectedStore]);

    const PAY_BY_LINK_SETTINGS_MENU_ITEMS = useMemo(() => MENU_ITEMS.map(item => ({ ...item, label: i18n.get(item.label) })), []);

    return (
        <section className={CONTAINER_CLASS_NAME}>
            <Header hideTitle={props.hideTitle} titleKey="payByLink.settings.title" />
            <div className={CONTENT_CONTAINER_CLASS_NAME}>
                <div className={SIDEBAR_CONTAINER_CLASS_NAME}>
                    <StoreSelector stores={stores} selectedStoreId={selectedStore} setSelectedStoreId={setSelectedStore} />
                    <SecondaryNav
                        className={SECONDARY_NAV_CLASS_NAME}
                        items={PAY_BY_LINK_SETTINGS_MENU_ITEMS}
                        activeValue={activeMenuItem}
                        onValueChange={setActiveMenuItem}
                    />
                </div>
                <Divider variant="vertical" />
                {selectedStore && <PayByLinkSettingsContent activeMenuItem={activeMenuItem} selectedStoreID={selectedStore} />}
            </div>
            {/*<div className="adyen-pe-pay-by-link-settings__cta-container">*/}
            {/*    <Button variant={ButtonVariant.PRIMARY} onClick={noop}>*/}
            {/*        {i18n.get('payByLink.settings.common.action.save')}*/}
            {/*    </Button>*/}
            {/*</div>*/}
        </section>
    );
};

export default PayByLinkSettingsContainer;

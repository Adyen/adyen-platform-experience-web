import { SecondaryNav } from '../../../../../internal/SecondaryNav';
import { _UIComponentProps, PayByLinkSettingsComponentProps } from '../../../../../types';
import { CONTAINER_CLASS_NAME, SIDEBAR_CONTAINER_CLASS_NAME, SECONDARY_NAV_CLASS_NAME, CONTENT_CONTAINER_CLASS_NAME } from './constants';
import './PayByLinkSettingsContainer.scss';
import { StoreSelector } from '../../../../../internal/StoreSelector';
import { Header } from '../../../../../internal/Header';
import { usePayByLinkSettingsContext } from './context/context';
import PayByLinkSettingsContent from './components/PayByLinkSettingsContent/PayByLinkSettingsContent';
import SaveAction from './components/SaveAction';
import { MenuItemType } from './context/types';

const PayByLinkSettings = ({ ...props }: Omit<_UIComponentProps<PayByLinkSettingsComponentProps>, 'storeIds'>) => {
    const { activeMenuItem, setSelectedMenuItem, selectedStore, setSelectedStore, stores, menuItems } = usePayByLinkSettingsContext();

    if (!activeMenuItem || !selectedStore || !menuItems || menuItems.length === 0) return null;

    return (
        <div className={CONTAINER_CLASS_NAME}>
            <Header hideTitle={props.hideTitle} titleKey="payByLink.settings.title" />
            <div className={CONTENT_CONTAINER_CLASS_NAME}>
                {menuItems.length > 1 ? (
                    <div className={SIDEBAR_CONTAINER_CLASS_NAME}>
                        <SecondaryNav<MenuItemType>
                            renderHeader={() => (
                                <StoreSelector stores={stores} selectedStoreId={selectedStore} setSelectedStoreId={setSelectedStore} />
                            )}
                            className={SECONDARY_NAV_CLASS_NAME}
                            items={menuItems}
                            activeValue={activeMenuItem}
                            onValueChange={setSelectedMenuItem}
                            renderContent={(activeMenuItem: string) => <PayByLinkSettingsContent activeMenuItem={activeMenuItem} />}
                        />
                    </div>
                ) : (
                    <PayByLinkSettingsContent activeMenuItem={activeMenuItem} />
                )}
            </div>
            <SaveAction />
        </div>
    );
};

export default PayByLinkSettings;

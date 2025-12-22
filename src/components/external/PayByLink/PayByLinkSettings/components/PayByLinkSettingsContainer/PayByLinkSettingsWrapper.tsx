import { SecondaryNav } from '../../../../../internal/SecondaryNav';
import { _UIComponentProps, PayByLinkSettingsComponentProps } from '../../../../../types';
import { CONTAINER_CLASS_NAME, SIDEBAR_CONTAINER_CLASS_NAME, SECONDARY_NAV_CLASS_NAME, CONTENT_CONTAINER_CLASS_NAME } from './constants';
import { useMemo } from 'preact/hooks';
import './PayByLinkSettingsContainer.scss';
import { StoreSelector } from '../../../../../internal/StoreSelector';
import { Header } from '../../../../../internal/Header';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { usePayByLinkSettingsContext } from './context/context';
import { MENU_ITEMS } from './context/constants';
import PayByLinkSettingsContent from './components/PayByLinkSettingsContent/PayByLinkSettingsContent';
import SaveAction from './components/SaveAction';

const PayByLinkSettingsWrapper = ({ ...props }: _UIComponentProps<PayByLinkSettingsComponentProps>) => {
    const { i18n } = useCoreContext();
    const { activeMenuItem, setActiveMenuItem, selectedStore, setSelectedStore, stores } = usePayByLinkSettingsContext();

    const PAY_BY_LINK_SETTINGS_MENU_ITEMS = useMemo(() => MENU_ITEMS.map(item => ({ ...item, label: i18n.get(item.label) })), []);

    if (!activeMenuItem || !selectedStore) return null;

    return (
        <div className={CONTAINER_CLASS_NAME}>
            <Header hideTitle={props.hideTitle} titleKey="payByLink.settings.title" />
            <div className={CONTENT_CONTAINER_CLASS_NAME}>
                <div className={SIDEBAR_CONTAINER_CLASS_NAME}>
                    <SecondaryNav
                        renderHeader={() => <StoreSelector stores={stores} selectedStoreId={selectedStore} setSelectedStoreId={setSelectedStore} />}
                        className={SECONDARY_NAV_CLASS_NAME}
                        items={PAY_BY_LINK_SETTINGS_MENU_ITEMS}
                        activeValue={activeMenuItem}
                        onValueChange={setActiveMenuItem}
                        renderContent={(activeMenuItem: string) => <PayByLinkSettingsContent activeMenuItem={activeMenuItem} />}
                    />
                </div>
            </div>
            <SaveAction />
        </div>
    );
};

export default PayByLinkSettingsWrapper;

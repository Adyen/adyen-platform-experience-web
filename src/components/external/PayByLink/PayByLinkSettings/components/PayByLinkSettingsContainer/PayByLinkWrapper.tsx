import { SecondaryNav } from '../../../../../internal/SecondaryNav';
import { _UIComponentProps, PayByLinkSettingsComponentProps } from '../../../../../types';
import { CONTAINER_CLASS_NAME, SIDEBAR_CONTAINER_CLASS_NAME, SECONDARY_NAV_CLASS_NAME, CONTENT_CONTAINER_CLASS_NAME } from './constants';
import { useMemo } from 'preact/hooks';
import { Divider } from '../../../../../internal/Divider/Divider';
import './PayByLinkSettingsContainer.scss';
import { StoreSelector } from '../../../../../internal/StoreSelector';
import { Header } from '../../../../../internal/Header';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import PayByLinkSettingsMenuContent from './PayByLinkSettingsMenuContent';
import { usePayByLinkSettingsContext } from './context/context';
import { ButtonVariant } from '../../../../../internal/Button/types';
import Button from '../../../../../internal/Button';
import { MENU_ITEMS } from './context/constants';
import { useSaveAction } from '../../hooks/useSaveAction';

const SaveAction = () => {
    const { i18n } = useCoreContext();
    const { onSave } = useSaveAction();
    return (
        <div className="adyen-pe-pay-by-link-settings__cta-container">
            <Button variant={ButtonVariant.PRIMARY} onClick={onSave}>
                {i18n.get('payByLink.settings.common.action.save')}
            </Button>
        </div>
    );
};

const PayByLinkSettingsWrapper = ({ ...props }: _UIComponentProps<PayByLinkSettingsComponentProps>) => {
    const { i18n } = useCoreContext();
    const { activeMenuItem, setActiveMenuItem, selectedStore, setSelectedStore, stores } = usePayByLinkSettingsContext();

    const PAY_BY_LINK_SETTINGS_MENU_ITEMS = useMemo(() => MENU_ITEMS.map(item => ({ ...item, label: i18n.get(item.label) })), []);

    if (!activeMenuItem || !selectedStore) return null;

    return (
        <section className={CONTAINER_CLASS_NAME}>
            <Header hideTitle={props.hideTitle} titleKey="payByLink.settings.title" />
            <div className={CONTENT_CONTAINER_CLASS_NAME}>
                <div className={SIDEBAR_CONTAINER_CLASS_NAME}>
                    <SecondaryNav
                        renderHeader={() => <StoreSelector stores={stores} selectedStoreId={selectedStore} setSelectedStoreId={setSelectedStore} />}
                        className={SECONDARY_NAV_CLASS_NAME}
                        items={PAY_BY_LINK_SETTINGS_MENU_ITEMS}
                        activeValue={activeMenuItem}
                        onValueChange={setActiveMenuItem}
                        renderContent={(activeMenuItem: string) => <PayByLinkSettingsMenuContent activeMenuItem={activeMenuItem} />}
                    />
                </div>
            </div>
            <SaveAction />
        </section>
    );
};

export default PayByLinkSettingsWrapper;

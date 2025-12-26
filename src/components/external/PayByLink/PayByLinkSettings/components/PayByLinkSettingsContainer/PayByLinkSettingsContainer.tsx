import { _UIComponentProps, PayByLinkSettingsComponentProps } from '../../../../../types';
import './PayByLinkSettingsContainer.scss';
import { PayByLinkSettingsProvider } from './context/context';
import PayByLinkWrapper from './PayByLinkSettings';
import { PayByLinkSettingsItem } from './context/types';
import { useMemo } from 'preact/hooks';
import { MENU_ITEMS } from './context/constants';
import useCoreContext from '../../../../../../core/Context/useCoreContext';

const PayByLinkSettingsContainer = ({
    settingsItems,
    storeIds,
    ...props
}: _UIComponentProps<PayByLinkSettingsComponentProps> & { settingsItems?: PayByLinkSettingsItem[] }) => {
    const { i18n } = useCoreContext();

    const filteredMenuItems = useMemo(
        () => (settingsItems && settingsItems?.length > 0 ? MENU_ITEMS.filter(item => settingsItems.includes(item.value)) : MENU_ITEMS),
        [settingsItems]
    );

    const paymentLinkSettingsItem = useMemo(() => {
        const settingsItems = filteredMenuItems.length > 0 ? filteredMenuItems : MENU_ITEMS;
        return settingsItems.map(item => ({ ...item, label: i18n.get(item.label) }));
    }, [i18n, filteredMenuItems]);

    if (paymentLinkSettingsItem.length === 0) return <>{'Cannot load settings menu'}</>;

    return (
        <PayByLinkSettingsProvider selectedMenuItems={paymentLinkSettingsItem} storeIds={storeIds}>
            <PayByLinkWrapper {...props} />
        </PayByLinkSettingsProvider>
    );
};

export default PayByLinkSettingsContainer;

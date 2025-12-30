import { _UIComponentProps, type ExternalUIComponentProps, PayByLinkSettingsComponentProps } from '../../../../../types';
import './PayByLinkSettingsContainer.scss';
import { PayByLinkSettingsProvider } from './context/context';
import PayByLinkSettings from './PayByLinkSettings';
import { PayByLinkSettingsItem } from './context/types';
import { useMemo } from 'preact/hooks';
import { MENU_ITEMS } from './context/constants';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { ButtonVariant } from '../../../../../internal/Button/types';
import Icon from '../../../../../internal/Icon';
import Button from '../../../../../internal/Button/Button';

const PayByLinkSettingsContainer = ({
    settingsItems,
    storeIds,
    navigateBack,
    ...props
}: ExternalUIComponentProps<PayByLinkSettingsComponentProps> & { settingsItems?: PayByLinkSettingsItem[]; navigateBack?: () => void }) => {
    const { i18n } = useCoreContext();

    const filteredMenuItems = useMemo(
        () => (settingsItems && settingsItems?.length > 0 ? MENU_ITEMS.filter(item => settingsItems.includes(item.value)) : MENU_ITEMS),
        [settingsItems]
    );

    const paymentLinkSettingsItem = useMemo(() => {
        const settingsItems = filteredMenuItems.length > 0 ? filteredMenuItems : MENU_ITEMS;
        return settingsItems.map(item => ({ ...item, label: i18n.get(item.label) }));
    }, [i18n, filteredMenuItems]);

    return (
        <PayByLinkSettingsProvider selectedMenuItems={paymentLinkSettingsItem} storeIds={storeIds}>
            {navigateBack && (
                <Button onClick={navigateBack} variant={ButtonVariant.TERTIARY} iconButton style={{ transform: 'rotate(180deg)' }}>
                    <Icon name="arrow-right" />
                </Button>
            )}
            <PayByLinkSettings {...props} />
        </PayByLinkSettingsProvider>
    );
};

export default PayByLinkSettingsContainer;

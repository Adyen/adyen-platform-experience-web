import { type ExternalUIComponentProps, PaymentLinkSettingsComponentProps } from '../../../../../types';
import './PaymentLinkSettingsContainer.scss';
import { PaymentLinkSettingsProvider } from './context/context';
import PaymentLinkSettings from './PaymentLinkSettings';
import { PaymentLinkSettingsItem } from './context/types';
import { useMemo } from 'preact/hooks';
import { MENU_ITEMS } from './context/constants';
import useCoreContext from '../../../../../../core/Context/useCoreContext';

const PaymentLinkSettingsContainer = ({
    settingsItems,
    storeIds,
    embeddedInOverview,
    ...props
}: ExternalUIComponentProps<PaymentLinkSettingsComponentProps> & {
    settingsItems?: PaymentLinkSettingsItem[];
    navigateBack?: () => void;
    embeddedInOverview?: boolean;
}) => {
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
        <PaymentLinkSettingsProvider
            embeddedInOverview={embeddedInOverview}
            selectedMenuItems={paymentLinkSettingsItem}
            storeIds={storeIds}
            navigateBack={props?.navigateBack}
        >
            <PaymentLinkSettings {...props} />
        </PaymentLinkSettingsProvider>
    );
};

export default PaymentLinkSettingsContainer;

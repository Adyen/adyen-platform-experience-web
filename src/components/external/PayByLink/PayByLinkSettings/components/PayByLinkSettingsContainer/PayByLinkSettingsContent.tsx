import { ActiveMenuItem } from './PayByLinkSettingsContainer';
import TermsAndConditionsContainer from '../TermsAndConditions/TermsAndConditionsContainer';
import PayByLinkThemeContainer from '../PayByLinkThemeContainer/PayByLinkThemeContainer';

type PayByLinkSettingsContentProps = {
    activeMenuItem: string;
    selectedStoreID: string;
};

const PayByLinkSettingsContent = ({ activeMenuItem, selectedStoreID }: PayByLinkSettingsContentProps) => {
    switch (activeMenuItem) {
        case ActiveMenuItem.theme:
            return <PayByLinkThemeContainer selectedStore={selectedStoreID} />;
        case ActiveMenuItem.termsAndConditions:
            return <TermsAndConditionsContainer selectedStore={selectedStoreID} />;
        default:
            return null;
    }
};

export default PayByLinkSettingsContent;

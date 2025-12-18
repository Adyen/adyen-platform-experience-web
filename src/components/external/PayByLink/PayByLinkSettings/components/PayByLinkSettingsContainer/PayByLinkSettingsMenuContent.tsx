import TermsAndConditionsContainer from '../TermsAndConditions/TermsAndConditionsContainer';
import PayByLinkThemeContainer from '../PayByLinkThemeContainer/PayByLinkThemeContainer';
import { ActiveMenuItem } from './context/constants';

type PayByLinkSettingsContentProps = {
    activeMenuItem: string;
};

const PayByLinkSettingsMenuContent = ({ activeMenuItem }: PayByLinkSettingsContentProps) => {
    switch (activeMenuItem) {
        case ActiveMenuItem.theme:
            return <PayByLinkThemeContainer />;
        case ActiveMenuItem.termsAndConditions:
            return <TermsAndConditionsContainer />;
        default:
            return null;
    }
};

export default PayByLinkSettingsMenuContent;

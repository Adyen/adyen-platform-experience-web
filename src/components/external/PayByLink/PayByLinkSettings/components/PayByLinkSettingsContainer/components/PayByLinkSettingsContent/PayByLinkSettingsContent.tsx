import TermsAndConditionsContainer from '../../../TermsAndConditions/TermsAndConditionsContainer';
import PayByLinkThemeContainer from '../../../PayByLinkThemeContainer/PayByLinkThemeContainer';
import { MenuItem } from '../../context/constants';

type PayByLinkSettingsContentProps = {
    activeMenuItem: string | null;
};

const PayByLinkSettingsContent = ({ activeMenuItem }: PayByLinkSettingsContentProps) => {
    switch (activeMenuItem) {
        case MenuItem.theme:
            return <PayByLinkThemeContainer />;
        case MenuItem.termsAndConditions:
            return <TermsAndConditionsContainer />;
        default:
            return null;
    }
};

export default PayByLinkSettingsContent;

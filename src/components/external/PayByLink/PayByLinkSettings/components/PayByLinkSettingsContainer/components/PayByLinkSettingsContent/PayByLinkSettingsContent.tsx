import TermsAndConditionsContainer from '../../../TermsAndConditions/TermsAndConditionsContainer';
import PayByLinkThemeContainer from '../../../PayByLinkThemeContainer/PayByLinkThemeContainer';
import { MenuItem } from '../../context/constants';
import PayByLinkSettingsContentLoading from '../PayByLinkSettingsContentLoading/PayByLinkSettingsContentLoading';

type PayByLinkSettingsContentProps = {
    activeMenuItem: string | null;
    isLoadingContent: boolean;
};

const PayByLinkSettingsContent = ({ activeMenuItem, isLoadingContent }: PayByLinkSettingsContentProps) => {
    if (isLoadingContent) {
        return <PayByLinkSettingsContentLoading activeMenuItem={activeMenuItem} />;
    }
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

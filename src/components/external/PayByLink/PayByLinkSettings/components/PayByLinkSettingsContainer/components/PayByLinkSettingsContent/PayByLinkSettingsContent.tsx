import TermsAndConditionsContainer from '../../../TermsAndConditions/TermsAndConditionsContainer';
import PayByLinkThemeContainer from '../../../PayByLinkThemeContainer/PayByLinkThemeContainer';
import { MenuItem } from '../../context/constants';
import LoadingSkeleton from '../LoadingSkeleton/LoadingSkeleton';

type PayByLinkSettingsContentProps = {
    activeMenuItem: string | null;
    isLoadingContent: boolean;
};

const PayByLinkSettingsContent = ({ activeMenuItem, isLoadingContent }: PayByLinkSettingsContentProps) => {
    if (isLoadingContent) {
        return <LoadingSkeleton rowNumber={5} />;
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

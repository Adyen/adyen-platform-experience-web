import { MenuItem } from '../../context/constants';
import LoadingSkeleton from '../LoadingSkeleton/LoadingSkeleton';

const PaymentLinkSettingsContentLoading = ({ activeMenuItem }: { activeMenuItem: string | null }) => {
    switch (activeMenuItem) {
        case MenuItem.theme:
            return <LoadingSkeleton rowNumber={3} />;
        case MenuItem.termsAndConditions:
            return <LoadingSkeleton rowNumber={2} />;
        default:
            return <LoadingSkeleton rowNumber={3} />;
    }
};

export default PaymentLinkSettingsContentLoading;

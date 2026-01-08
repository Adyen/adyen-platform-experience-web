import TermsAndConditionsContainer from '../../../TermsAndConditions/TermsAndConditionsContainer';
import PaymentLinkThemeContainer from '../../../PaymentLinkThemeContainer/PaymentLinkThemeContainer';
import { MenuItem } from '../../context/constants';
import { containerQueries, useResponsiveContainer } from '../../../../../../../hooks/useResponsiveContainer';
import Alert from '../../../../../../internal/Alert/Alert';
import { AlertTypeOption, AlertVariantOption } from '../../../../../../internal/Alert/types';
import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import usePaymentLinkSettingsContext from '../../context/context';
import PaymentLinkSettingsContentLoading from '../PaymentLinkSettingsContentLoading/PaymentLinkSettingsContentLoading';

type PaymentLinkSettingsContentProps = {
    activeMenuItem: string | null;
    isLoadingContent: boolean;
    navigateBack?: () => void;
};

const PaymentLinkSettingsContentItem = ({ activeMenuItem, isLoadingContent }: PaymentLinkSettingsContentProps) => {
    if (isLoadingContent) {
        return <PaymentLinkSettingsContentLoading activeMenuItem={activeMenuItem} />;
    }
    switch (activeMenuItem) {
        case MenuItem.theme:
            return <PaymentLinkThemeContainer />;
        case MenuItem.termsAndConditions:
            return <TermsAndConditionsContainer />;
        default:
            return null;
    }
};

const PaymentLinkSettingsContent = ({ activeMenuItem, isLoadingContent, navigateBack }: PaymentLinkSettingsContentProps) => {
    const isSmContainer = useResponsiveContainer(containerQueries.down.xs);
    const { i18n } = useCoreContext();
    const { isSaveSuccess, isSaveError, setIsSaveSuccess, setIsSaveError } = usePaymentLinkSettingsContext();

    return (
        <div className={isSmContainer ? 'adyen-pe-payment-link-settings__content-item--mobile' : 'adyen-pe-payment-link-settings__content-item'}>
            <PaymentLinkSettingsContentItem activeMenuItem={activeMenuItem} isLoadingContent={isLoadingContent} />
            {isSaveSuccess && !navigateBack && (
                <Alert
                    type={AlertTypeOption.SUCCESS}
                    variant={AlertVariantOption.TIP}
                    onClose={() => setIsSaveSuccess(false)}
                    description={i18n.get('payByLink.settings.common.alerts.saveSuccess')}
                    className={'adyen-pe-payment-link-settings__content-item--alert'}
                />
            )}
            {isSaveError && (
                <Alert
                    type={AlertTypeOption.CRITICAL}
                    variant={AlertVariantOption.TIP}
                    onClose={() => setIsSaveError(false)}
                    description={i18n.get('payByLink.settings.common.alerts.saveError')}
                    className={'adyen-pe-payment-link-settings__content-item--alert'}
                />
            )}
        </div>
    );
};

export default PaymentLinkSettingsContent;

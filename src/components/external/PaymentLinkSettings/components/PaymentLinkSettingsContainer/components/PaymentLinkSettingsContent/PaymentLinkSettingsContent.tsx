import TermsAndConditionsContainer from '../../../TermsAndConditions/TermsAndConditionsContainer';
import PaymentLinkThemeContainer from '../../../PaymentLinkThemeContainer/PaymentLinkThemeContainer';
import { MenuItem } from '../../context/constants';
import { containerQueries, useResponsiveContainer } from '../../../../../../../hooks/useResponsiveContainer';
import Alert from '../../../../../../internal/Alert/Alert';
import { AlertTypeOption, AlertVariantOption } from '../../../../../../internal/Alert/types';
import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import usePaymentLinkSettingsContext from '../../context/context';
import PaymentLinkSettingsContentLoading from '../PaymentLinkSettingsContentLoading/PaymentLinkSettingsContentLoading';
import { useSettingsPermission } from '../../../../hooks/useSettingsPermission';
import SettingsError from '../SettingsError/SettingsError';
import AdyenPlatformExperienceError from '../../../../../../../core/Errors/AdyenPlatformExperienceError';
import { useMemo } from 'preact/hooks';
import { PERMISSION_ERROR } from '../../utils/getSettingsErrorMessage';

const THEME_ERROR_MESSAGE_KEY = 'payByLink.settings.theme.errors.couldNotLoad';
const TERMS_AND_CONDITIONS_ERROR_MESSAGE_KEY = 'payByLink.settings.termsAndConditions.errors.couldNotLoad';

type PaymentLinkSettingsContentProps = {
    activeMenuItem: string | null;
    isLoadingContent: boolean;
    navigateBack?: () => void;
};

const PaymentLinkSettingsContentItem = ({ activeMenuItem, isLoadingContent }: PaymentLinkSettingsContentProps) => {
    const { themeViewEnabled, termsAndConditionsViewEnabled } = useSettingsPermission();

    const permissionError = useMemo(() => {
        if (themeViewEnabled && termsAndConditionsViewEnabled) return undefined;
        return {
            errorCode: PERMISSION_ERROR,
            type: 'error',
            requestId: '',
        } as AdyenPlatformExperienceError;
    }, [themeViewEnabled, termsAndConditionsViewEnabled]);

    if (isLoadingContent) {
        return <PaymentLinkSettingsContentLoading activeMenuItem={activeMenuItem} />;
    }
    switch (activeMenuItem) {
        case MenuItem.theme: {
            if (!themeViewEnabled) return <SettingsError error={permissionError} errorMessage={THEME_ERROR_MESSAGE_KEY} />;
            return <PaymentLinkThemeContainer />;
        }
        case MenuItem.termsAndConditions: {
            if (!termsAndConditionsViewEnabled)
                return <SettingsError error={permissionError} errorMessage={TERMS_AND_CONDITIONS_ERROR_MESSAGE_KEY} />;
            return <TermsAndConditionsContainer />;
        }
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

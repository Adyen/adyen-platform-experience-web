import './PaymentLinkThemeContainer.scss';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyVariant } from '../../../../internal/Typography/types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import usePaymentLinkSettingsContext from '../PaymentLinkSettingsContainer/context/context';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { ThemeForm } from './components/ThemeForm';
import { isThemeData, isThemePayload } from './types';
import LoadingSkeleton from '../PaymentLinkSettingsContainer/components/LoadingSkeleton/LoadingSkeleton';
import SettingsError from '../PaymentLinkSettingsContainer/components/SettingsError/SettingsError';
import { ThemeFormData } from '../PaymentLinkSettingsContainer/context/types';

const ERROR_MESSAGE_KEY = 'payByLink.settings.theme.errors.couldNotLoad';

const PaymentLinkThemeContainer = () => {
    const { i18n } = useCoreContext();
    const { payload, setSavedData, savedData: theme, themeError, isLoadingContent } = usePaymentLinkSettingsContext();
    const [initialPayload, setInitialPayload] = useState<FormData>();

    useEffect(() => {
        if (isThemePayload(payload)) {
            setInitialPayload(payload);
        }
    }, [payload, setSavedData, setInitialPayload]);

    const data = useMemo(() => {
        if (!isLoadingContent && !themeError) {
            return theme && typeof theme === 'object' && Object.keys(theme).length > 0 ? (theme as ThemeFormData) : { brandName: '' };
        }
        return { brandName: '' };
    }, [theme, isLoadingContent, themeError]);

    if (themeError) {
        return (
            <section className="adyen-pe-payment-link-theme">
                <SettingsError error={themeError} errorMessage={ERROR_MESSAGE_KEY} />
            </section>
        );
    }

    if (!theme || !isThemeData(data) || !initialPayload) {
        return <LoadingSkeleton rowNumber={3} />;
    }

    return (
        <section className="adyen-pe-payment-link-theme">
            <div className="adyen-pe-payment-link-settings__content-header">
                <Typography variant={TypographyVariant.TITLE} medium>
                    {i18n.get('payByLink.settings.theme.title')}
                </Typography>
                <Typography variant={TypographyVariant.BODY} wide className="adyen-pe-payment-link-settings-terms-and-conditions-disclaimer">
                    {i18n.get('payByLink.settings.theme.subtitle')}
                </Typography>
            </div>
            <ThemeForm theme={data} initialPayload={initialPayload} />
        </section>
    );
};

export default PaymentLinkThemeContainer;

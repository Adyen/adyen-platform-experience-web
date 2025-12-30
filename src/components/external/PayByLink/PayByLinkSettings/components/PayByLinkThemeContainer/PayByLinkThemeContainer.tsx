import './PayByLinkThemeContainer.scss';
import Typography from '../../../../../internal/Typography/Typography';
import { TypographyVariant } from '../../../../../internal/Typography/types';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import usePayByLinkSettingsContext from '../PayByLinkSettingsContainer/context/context';
import { useEffect, useState } from 'preact/hooks';
import { ThemeForm } from './components/ThemeForm';
import { isTermsAndConditionsData, isThemePayload } from './types';
import LoadingSkeleton from '../PayByLinkSettingsContainer/components/LoadingSkeleton/LoadingSkeleton';

const PayByLinkThemeContainer = () => {
    const { i18n } = useCoreContext();
    const { payload, setSavedData, savedData: theme } = usePayByLinkSettingsContext();
    const [initialPayload, setInitialPayload] = useState<FormData>();

    useEffect(() => {
        if (isThemePayload(payload)) {
            setInitialPayload(payload);
        }
    }, [payload, setSavedData, setInitialPayload]);

    if (!theme || isTermsAndConditionsData(theme) || !initialPayload) {
        return <LoadingSkeleton rowNumber={5} />;
    }

    return (
        <section className="adyen-pe-pay-by-link-theme">
            <div className="adyen-pe-pay-by-link-settings__content-header">
                <Typography variant={TypographyVariant.TITLE} medium>
                    {i18n.get('payByLink.settings.theme.title')}
                </Typography>
                <Typography variant={TypographyVariant.BODY} wide className="adyen-pe-pay-by-link-settings-terms-and-conditions-disclaimer">
                    {i18n.get('payByLink.settings.theme.subtitle')}
                </Typography>
            </div>
            <ThemeForm theme={theme} initialPayload={initialPayload} />
        </section>
    );
};

export default PayByLinkThemeContainer;

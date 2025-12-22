import './PayByLinkThemeContainer.scss';
import Spinner from '../../../../../internal/Spinner';
import Typography from '../../../../../internal/Typography/Typography';
import { TypographyVariant } from '../../../../../internal/Typography/types';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import usePayByLinkSettingsContext from '../PayByLinkSettingsContainer/context/context';
import { useEffect, useState } from 'preact/hooks';
import { getThemePayload } from '../PayByLinkSettingsContainer/utils/getThemePayload';
import { useStoreTheme } from '../../hooks/useStoreTheme';
import { ThemeForm } from './components/ThemeForm';

const PayByLinkThemeContainer = () => {
    const { i18n } = useCoreContext();
    const { activeMenuItem, selectedStore, setPayload, setSavedData } = usePayByLinkSettingsContext();
    const [enabled, setEnabled] = useState(true);
    const [initialPayload, setInitialPayload] = useState<FormData>();

    useEffect(() => {
        setEnabled(true);
    }, [activeMenuItem, selectedStore]);

    const { theme, isFetching } = useStoreTheme(selectedStore, enabled, setEnabled);

    useEffect(() => {
        if (theme && !initialPayload) {
            const themeData = { brandName: theme.brandName, logo: theme.logoUrl, fullWidthLogo: theme.fullWidthLogoUrl };
            const initialThemePayload = getThemePayload(themeData);
            setPayload(initialThemePayload);
            setSavedData(theme);
            setInitialPayload(initialThemePayload);
        }
    }, [theme, setPayload, setSavedData, setInitialPayload, initialPayload]);

    if (!theme || !selectedStore || !initialPayload) return null;

    if (isFetching) return <Spinner size={'x-small'} />;

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

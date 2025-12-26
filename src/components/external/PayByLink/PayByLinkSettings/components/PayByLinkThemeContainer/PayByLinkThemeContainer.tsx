import './PayByLinkThemeContainer.scss';
import Typography from '../../../../../internal/Typography/Typography';
import { TypographyVariant } from '../../../../../internal/Typography/types';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import usePayByLinkSettingsContext from '../PayByLinkSettingsContainer/context/context';
import { useEffect, useState } from 'preact/hooks';
import { ThemeForm } from './components/ThemeForm';
import { isTermsAndConditionsData, isThemePayload } from './types';
import DataOverviewDetailsSkeleton from '../../../../../internal/DataOverviewDetails/DataOverviewDetailsSkeleton';

const PayByLinkThemeContainer = () => {
    const { i18n } = useCoreContext();
    const { selectedStore, payload, setSavedData, savedData: theme, isLoadingContent } = usePayByLinkSettingsContext();
    const [initialPayload, setInitialPayload] = useState<FormData>();

    useEffect(() => {
        if (isThemePayload(payload)) {
            setInitialPayload(payload);
        }
    }, [payload, setSavedData, setInitialPayload]);

    if (isLoadingContent) return <DataOverviewDetailsSkeleton skeletonRowNumber={6} />;

    if (!selectedStore || !theme || isTermsAndConditionsData(theme) || !initialPayload) return null;

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

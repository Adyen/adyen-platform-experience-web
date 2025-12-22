import './TermsAndConditions.scss';
import Typography from '../../../../../internal/Typography/Typography';
import { TypographyVariant } from '../../../../../internal/Typography/types';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { TermsAndConditions } from './TermsAndConditions';
import usePayByLinkSettingsContext from '../PayByLinkSettingsContainer/context/context';
import { useState, useEffect } from 'preact/hooks';
import { useStoreTermsAndConditions } from '../../hooks/useStoreTermsAndConditions';
import Spinner from '../../../../../internal/Spinner';
import { isTermsAndConditionsData } from '../PayByLinkThemeContainer/types';
import { IPayByLinkTermsAndConditions } from '../../../../../../types';

const TermsAndConditionsContainer = () => {
    const { i18n } = useCoreContext();
    const { activeMenuItem, selectedStore, setPayload, setSavedData } = usePayByLinkSettingsContext();
    const [enabled, setEnabled] = useState(true);
    const [initialData, setInitialData] = useState<IPayByLinkTermsAndConditions>();

    useEffect(() => {
        setEnabled(true);
    }, [activeMenuItem, selectedStore]);

    const { data, isFetching } = useStoreTermsAndConditions(selectedStore, enabled, setEnabled);

    useEffect(() => {
        if (data && !initialData) {
            setPayload(data);
            setSavedData(data);
            setInitialData(data);
        }
    }, [data, setPayload, setSavedData, initialData]);

    if (!data || !selectedStore || !isTermsAndConditionsData(data) || !initialData) return null;

    if (isFetching) return <Spinner size={'x-small'} />;

    return (
        <section className="adyen-pe-pay-by-link-settings">
            <div className="adyen-pe-pay-by-link-settings__content-header">
                <div className="adyen-pe-pay-by-link-settings__content-header">
                    <Typography variant={TypographyVariant.TITLE} medium>
                        {i18n.get('payByLink.settings.termsAndConditions.title')}
                    </Typography>
                    <Typography variant={TypographyVariant.BODY} wide className="adyen-pe-pay-by-link-settings-terms-and-conditions-disclaimer">
                        {i18n.get('payByLink.settings.termsAndConditions.subtitle')}
                    </Typography>
                </div>
            </div>
            <TermsAndConditions data={data} initialData={initialData} />
        </section>
    );
};

export default TermsAndConditionsContainer;

import './TermsAndConditions.scss';
import Typography from '../../../../../internal/Typography/Typography';
import { TypographyVariant } from '../../../../../internal/Typography/types';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { TermsAndConditions } from './TermsAndConditions';
import usePayByLinkSettingsContext from '../PayByLinkSettingsContainer/context/context';
import { useState, useEffect } from 'preact/hooks';
import { isTermsAndConditionsData } from '../PayByLinkThemeContainer/types';
import { IPayByLinkTermsAndConditions } from '../../../../../../types';
import LoadingSkeleton from '../PayByLinkSettingsContainer/components/LoadingSkeleton/LoadingSkeleton';
import cx from 'classnames';

const TermsAndConditionsContainer = () => {
    const { i18n } = useCoreContext();
    const { setPayload, setSavedData, savedData: termsAndConditionsData, isShowingRequirements } = usePayByLinkSettingsContext();
    const [initialData, setInitialData] = useState<IPayByLinkTermsAndConditions>();

    useEffect(() => {
        if (termsAndConditionsData && !initialData && isTermsAndConditionsData(termsAndConditionsData)) {
            setInitialData(termsAndConditionsData);
        }
    }, [termsAndConditionsData, setPayload, setSavedData, initialData]);

    if (!isTermsAndConditionsData(termsAndConditionsData) || !initialData) {
        return <LoadingSkeleton rowNumber={2} />;
    }

    return (
        <section className="adyen-pe-pay-by-link-settings-terms-and-conditions">
            <div
                className={cx('adyen-pe-pay-by-link-settings-terms-and-conditions__content-header', {
                    'adyen-pe-pay-by-link-settings-terms-and-conditions__content-header--hidden': isShowingRequirements,
                })}
            >
                <div className="adyen-pe-pay-by-link-settings-terms-and-conditions__content-header">
                    <Typography variant={TypographyVariant.TITLE} medium>
                        {i18n.get('payByLink.settings.termsAndConditions.title')}
                    </Typography>
                    <Typography variant={TypographyVariant.BODY} wide className="adyen-pe-pay-by-link-settings-terms-and-conditions-disclaimer">
                        {i18n.get('payByLink.settings.termsAndConditions.subtitle')}
                    </Typography>
                </div>
            </div>
            <TermsAndConditions data={termsAndConditionsData} initialData={initialData} />
        </section>
    );
};

export default TermsAndConditionsContainer;

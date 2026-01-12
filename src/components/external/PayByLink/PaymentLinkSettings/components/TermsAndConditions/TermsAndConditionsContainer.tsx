import './TermsAndConditions.scss';
import Typography from '../../../../../internal/Typography/Typography';
import { TypographyVariant } from '../../../../../internal/Typography/types';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { TermsAndConditions } from './TermsAndConditions';
import usePaymentLinkSettingsContext from '../PaymentLinkSettingsContainer/context/context';
import { useState, useEffect } from 'preact/hooks';
import { IPaymentLinkTermsAndConditions } from '../../../../../../types';
import cx from 'classnames';
import { isTermsAndConditionsData } from '../PaymentLinkThemeContainer/types';
import SettingsError from '../PaymentLinkSettingsContainer/components/SettingsError/SettingsError';
import LoadingSkeleton from '../PaymentLinkSettingsContainer/components/LoadingSkeleton/LoadingSkeleton';

const ERROR_MESSAGE_KEY = 'payByLink.settings.termsAndConditions.errors.couldNotLoad';

const TermsAndConditionsContainer = () => {
    const { i18n } = useCoreContext();
    const { savedData: termsAndConditionsData, isLoadingContent, termsAndConditionsError, isShowingRequirements } = usePaymentLinkSettingsContext();
    const [initialData, setInitialData] = useState<IPaymentLinkTermsAndConditions>();

    useEffect(() => {
        if (!isLoadingContent && !termsAndConditionsError) {
            const data =
                termsAndConditionsData && typeof termsAndConditionsData === 'object' && Object.keys(termsAndConditionsData).length > 0
                    ? (termsAndConditionsData as IPaymentLinkTermsAndConditions)
                    : { termsOfServiceUrl: '' };
            setInitialData(data);
        }
    }, [termsAndConditionsData, setInitialData, isLoadingContent, termsAndConditionsError]);

    if (termsAndConditionsError) {
        return <SettingsError error={termsAndConditionsError} errorMessage={ERROR_MESSAGE_KEY} />;
    }

    if (!isTermsAndConditionsData(termsAndConditionsData) || !initialData) {
        return <LoadingSkeleton rowNumber={2} />;
    }

    return (
        <section className="adyen-pe-payment-link-settings-terms-and-conditions">
            <div
                className={cx('adyen-pe-payment-link-settings-terms-and-conditions__content-header', {
                    'adyen-pe-payment-link-settings-terms-and-conditions__content-header--hidden': isShowingRequirements,
                })}
            >
                <div className="adyen-pe-payment-link-settings-terms-and-conditions__content-header">
                    <Typography variant={TypographyVariant.TITLE} medium>
                        {i18n.get('payByLink.settings.termsAndConditions.title')}
                    </Typography>
                    <Typography variant={TypographyVariant.BODY} wide className="adyen-pe-payment-link-settings-terms-and-conditions-disclaimer">
                        {i18n.get('payByLink.settings.termsAndConditions.subtitle')}
                    </Typography>
                </div>
            </div>
            <TermsAndConditions data={termsAndConditionsData} initialData={initialData} />
        </section>
    );
};

export default TermsAndConditionsContainer;

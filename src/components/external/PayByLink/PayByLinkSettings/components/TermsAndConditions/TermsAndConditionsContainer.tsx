import './TermsAndConditions.scss';
import Typography from '../../../../../internal/Typography/Typography';
import { TypographyVariant } from '../../../../../internal/Typography/types';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { TermsAndConditions } from './TermsAndConditions';

export interface PayByLinkTermsAndConditionsContainerProps {
    selectedStore: string;
}

const TermsAndConditionsContainer = (props: PayByLinkTermsAndConditionsContainerProps) => {
    const { i18n } = useCoreContext();

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
            <TermsAndConditions {...props} />
            {/*{false ? (<Spinner size={'x-small'} />) : (*/}
            {/*    <>*/}
            {/*        <TermsAndConditions {...props} />*/}
            {/*    </>*/}
            {/*)}*/}
        </section>
    );
};

export default TermsAndConditionsContainer;

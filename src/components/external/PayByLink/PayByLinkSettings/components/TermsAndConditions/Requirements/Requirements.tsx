import { useCallback, useEffect } from 'preact/hooks';
import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import { TranslationKey } from '../../../../../../../translations';
import Typography from '../../../../../../internal/Typography/Typography';
import { TypographyVariant } from '../../../../../../internal/Typography/types';
import { useTermsRequirementsConfig } from './useTermsRequirementsConfig';
import './Requirements.scss';
import Button from '../../../../../../internal/Button';
import { ButtonVariant } from '../../../../../../internal/Button/types';

export const Requirements = ({
    onGoBack,
    acceptRequirements,
    termsAndConditionsURL,
}: {
    onGoBack: () => void;
    acceptRequirements: () => void;
    termsAndConditionsURL?: string;
}) => {
    const { termsRequirementsConfig, getTermsRequirementsConfig } = useTermsRequirementsConfig();
    const { i18n } = useCoreContext();

    const onAcceptRequirements = useCallback(() => {
        acceptRequirements();
        onGoBack();
    }, [acceptRequirements, onGoBack]);

    useEffect(() => {
        void getTermsRequirementsConfig();
    }, [getTermsRequirementsConfig]);

    return (
        <div className="adyen-pe-pay-by-link-requirements">
            <Typography variant={TypographyVariant.SUBTITLE} stronger>
                {i18n.get(termsRequirementsConfig.titleKey as TranslationKey)}
            </Typography>
            <div className="adyen-pe-pay-by-link-requirements__sections-container">
                {termsRequirementsConfig.sections.map(section => (
                    <div key={section.id} className="adyen-pe-pay-by-link-requirements__section">
                        <Typography variant={TypographyVariant.SUBTITLE} stronger>
                            {i18n.get(section.titleKey as TranslationKey)}
                        </Typography>
                        <div className="adyen-pe-pay-by-link-requirements__section-content">
                            <Typography className="adyen-pe-pay-by-link-requirements__description" variant={TypographyVariant.BODY}>
                                {i18n.get(section.descriptionKey as TranslationKey)}
                            </Typography>
                            <ul className="adyen-pe-pay-by-link-requirements__list">
                                {section.items.map(item => (
                                    <li key={item.key}>
                                        <Typography variant={TypographyVariant.BODY}>{i18n.get(item.key as TranslationKey)}</Typography>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
            <div className="adyen-pe-pay-by-link-requirements__buttons-container">
                <Button variant={ButtonVariant.SECONDARY} onClick={onGoBack}>
                    {i18n.get('payByLink.settings.terms.requirements.actions.goBack')}
                </Button>
                {termsAndConditionsURL && (
                    <Button variant={ButtonVariant.PRIMARY} onClick={onAcceptRequirements}>
                        {i18n.get('payByLink.settings.terms.requirements.actions.confirmRequirements')}
                    </Button>
                )}
            </div>
        </div>
    );
};

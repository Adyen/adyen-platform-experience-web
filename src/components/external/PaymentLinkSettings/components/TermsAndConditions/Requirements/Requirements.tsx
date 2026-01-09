import { useCallback, useEffect } from 'preact/hooks';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import Typography from '../../../../../internal/Typography/Typography';
import { TypographyVariant } from '../../../../../internal/Typography/types';
import { useTermsRequirementsConfig } from './useTermsRequirementsConfig';
import './Requirements.scss';
import Button from '../../../../../internal/Button';
import { ButtonVariant } from '../../../../../internal/Button/types';
import Modal from '../../../../../internal/Modal';

export const Requirements = ({
    onGoBack,
    acceptRequirements,
    termsAndConditionsURL,
    embeddedInOverview = false,
}: {
    onGoBack: () => void;
    acceptRequirements: () => void;
    termsAndConditionsURL?: string;
    embeddedInOverview?: boolean;
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

    const content = (
        <div className="adyen-pe-payment-link-requirements">
            <Typography variant={TypographyVariant.SUBTITLE} stronger>
                {i18n.get(termsRequirementsConfig.titleKey)}
            </Typography>
            <div className="adyen-pe-payment-link-requirements__sections-container">
                {termsRequirementsConfig.sections.map(section => (
                    <div key={section.id} className="adyen-pe-payment-link-requirements__section">
                        <Typography variant={TypographyVariant.SUBTITLE} stronger>
                            {i18n.get(section.titleKey)}
                        </Typography>
                        <div className="adyen-pe-payment-link-requirements__section-content">
                            <Typography className="adyen-pe-payment-link-requirements__description" variant={TypographyVariant.BODY}>
                                {i18n.get(section.descriptionKey)}
                            </Typography>
                            <ul className="adyen-pe-payment-link-requirements__list">
                                {section.items.map(item => (
                                    <li key={item.key}>
                                        <Typography variant={TypographyVariant.BODY}>{i18n.get(item.key)}</Typography>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
            <div className="adyen-pe-payment-link-requirements__buttons-container">
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

    if (embeddedInOverview) {
        return content;
    }

    return (
        <Modal isOpen onClose={onGoBack} isDismissible={true} headerWithBorder={false} size="large">
            {content}
        </Modal>
    );
};

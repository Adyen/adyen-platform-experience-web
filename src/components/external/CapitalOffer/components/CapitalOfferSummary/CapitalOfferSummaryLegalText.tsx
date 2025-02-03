import { useConfigContext } from '../../../../../core/ConfigContext';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import AnchorButton from '../../../../internal/AnchorButton/AnchorButton';
import { ButtonVariant } from '../../../../internal/Button/types';
import { AllowedLocations } from '../../../../internal/CapitalHeader/constants';
import Card from '../../../../internal/Card/Card';
import { Translation } from '../../../../internal/Translation';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { SUMMARY_TEXT_EMAIL } from './constants';

export const CapitalOfferSummaryLegalText = () => {
    const { i18n } = useCoreContext();
    const countryCode = useConfigContext()?.extraConfig?.legalEntity?.countryCode;

    return countryCode === AllowedLocations.US ? (
        <Card filled noOutline>
            <Typography variant={TypographyVariant.CAPTION} className={'adyen-pe-capital-offer-summary__legal-text--title'}>
                <Translation translationKey={'capital.summaryLegalTextTitle'} fills={{ break: <br></br> }} />
            </Typography>
            <br />
            <Typography variant={TypographyVariant.CAPTION} className={'adyen-pe-capital-offer-summary__legal-text--subtitle'}>
                {
                    <Translation
                        translationKey={'capital.summaryLegalText'}
                        fills={{
                            email: (
                                <AnchorButton
                                    href={`mailto:${SUMMARY_TEXT_EMAIL}`}
                                    variant={ButtonVariant.TERTIARY}
                                    className={'adyen-pe-capital-offer-summary__info--email'}
                                >
                                    {SUMMARY_TEXT_EMAIL}
                                </AnchorButton>
                            ),
                            break: <br />,
                        }}
                    />
                }
            </Typography>
        </Card>
    ) : null;
};

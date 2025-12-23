import { useConfigContext } from '../../../../../core/ConfigContext';
import AnchorButton from '../../../../internal/AnchorButton/AnchorButton';
import { ButtonVariant } from '../../../../internal/Button/types';
import { SupportedLocation } from '../../../../internal/CapitalHeader/constants';
import Card from '../../../../internal/Card/Card';
import { Translation } from '../../../../internal/Translation';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { SUMMARY_TEXT_EMAIL } from '../CapitalOfferSummary/constants';
import './CapitalOfferLegalNotice.scss';

export const CapitalOfferLegalNotice = () => {
    const countryCode = useConfigContext()?.extraConfig?.legalEntity?.countryCode;

    return countryCode === SupportedLocation.US ? (
        <Card filled noOutline>
            <Typography variant={TypographyVariant.CAPTION} className={'adyen-pe-capital-offer-legal-notice--title'}>
                <Translation translationKey={'capital.offer.summary.legalNotice.US.title'} fills={{ break: <br /> }} />
            </Typography>
            <br />
            <Typography variant={TypographyVariant.CAPTION} className={'adyen-pe-capital-offer-legal-notice--description'}>
                {
                    <Translation
                        translationKey={'capital.offer.summary.legalNotice.US.note'}
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
                            break: (
                                <>
                                    <br />
                                    <br />
                                </>
                            ),
                        }}
                    />
                }
            </Typography>
        </Card>
    ) : null;
};

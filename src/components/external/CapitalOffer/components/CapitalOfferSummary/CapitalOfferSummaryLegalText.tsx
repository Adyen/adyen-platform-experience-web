import { useConfigContext } from '../../../../../core/ConfigContext';
import AnchorButton from '../../../../internal/AnchorButton/AnchorButton';
import Button from '../../../../internal/Button';
import { ButtonVariant } from '../../../../internal/Button/types';
import { AllowedLocations } from '../../../../internal/CapitalHeader/constants';
import Card from '../../../../internal/Card/Card';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { US_SUMMARY_TEXT_EMAIL, US_SUMMARY_TEXT_FIRST_PART, US_SUMMARY_TEXT_SECOND_PART, US_SUMMARY_TITLE } from './constants';

export const CapitalOfferSummaryLegalText = () => {
    const region = useConfigContext()?.extraConfig?.legalEntity?.countryCode;

    return region === AllowedLocations.US ? (
        <Card filled noOutline>
            <Typography variant={TypographyVariant.CAPTION} el={TypographyElement.DIV}>
                {US_SUMMARY_TITLE}
            </Typography>
            <Typography variant={TypographyVariant.CAPTION} el={TypographyElement.PARAGRAPH} className={'adyen-pe-capital-offer-summary__info--text'}>
                {US_SUMMARY_TEXT_FIRST_PART}
            </Typography>
            <AnchorButton
                href={`mailto:${US_SUMMARY_TEXT_EMAIL}`}
                variant={ButtonVariant.TERTIARY}
                className={'adyen-pe-capital-offer-summary__info--email'}
            >
                {US_SUMMARY_TEXT_EMAIL}
            </AnchorButton>
            <Typography variant={TypographyVariant.CAPTION} el={TypographyElement.PARAGRAPH} className={'adyen-pe-capital-offer-summary__info--text'}>
                {US_SUMMARY_TEXT_SECOND_PART}
            </Typography>
        </Card>
    ) : null;
};

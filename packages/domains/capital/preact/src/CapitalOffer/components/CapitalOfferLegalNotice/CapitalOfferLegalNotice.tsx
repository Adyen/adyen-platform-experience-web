import AnchorButton from '@integration-components/ui-components-preact/AnchorButton/AnchorButton';
import { ButtonVariant } from '@integration-components/types';
import Card from '@integration-components/ui-components-preact/Card/Card';
import { Translation } from '@integration-components/ui-components-preact/Translation';
import { TypographyVariant } from '@integration-components/ui-components-preact/Typography/types';
import Typography from '@integration-components/ui-components-preact/Typography/Typography';
import { SUMMARY_TEXT_EMAIL } from '../CapitalOfferSummary/constants';
import './CapitalOfferLegalNotice.scss';

type CapitalOfferLegalNoticeProps = {
    region?: string;
};

export const CapitalOfferLegalNotice = ({ region }: CapitalOfferLegalNoticeProps) => {
    return region === 'US' ? (
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

import InfoBox from '../../../../internal/InfoBox';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { IGrantOfferResponseDTO } from '../../../../../types';
import { useMemo } from 'preact/hooks';
import { getExpectedRepaymentDate } from '../utils/utils';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import StructuredList from '../../../../internal/StructuredList';
import './CapitalOfferSummary.scss';
import Button from '../../../../internal/Button/Button';
import { ButtonVariant } from '../../../../internal/Button/types';
import useMutation from '../../../../../hooks/useMutation/useMutation';
import { useAuthContext } from '../../../../../core/Auth';
import { Tooltip } from '../../../../internal/Tooltip/Tooltip';

export const CapitalOfferSummary = ({
    grantOffer,
    repaymentFrequency,
    onBack,
    onOfferSigned,
}: {
    grantOffer: IGrantOfferResponseDTO;
    repaymentFrequency: number;
    onBack: () => void;
    onOfferSigned: () => void;
}) => {
    const { i18n } = useCoreContext();
    const expectedRepaymentDate = useMemo(() => {
        const date = getExpectedRepaymentDate(grantOffer.expectedRepaymentPeriodDays);
        return date ? i18n.date(date, { month: 'long' }) : null;
    }, [grantOffer, i18n]);

    const { signOffer } = useAuthContext().endpoints;

    const signOfferMutation = useMutation({ queryFn: signOffer });

    return (
        <div className="adyen-pe-capital-offer-summary">
            <InfoBox>
                <Typography el={TypographyElement.PARAGRAPH} variant={TypographyVariant.BODY}>
                    {i18n.get('capital.youAreRequestingFundingOf')}{' '}
                    <strong>{`${i18n.amount(grantOffer.grantAmount.value, grantOffer.grantAmount.currency)}.`}</strong>
                </Typography>
                <Typography el={TypographyElement.PARAGRAPH} variant={TypographyVariant.CAPTION}>
                    {i18n.get('capital.minimumRepaymentFrequency', {
                        values: {
                            amount: i18n.amount(grantOffer.thresholdAmount.value, grantOffer.thresholdAmount.currency),
                            days: repaymentFrequency,
                            date: expectedRepaymentDate ?? '',
                        },
                    })}
                </Typography>
            </InfoBox>
            <div className="adyen-pe-capital-offer-summary__details">
                <StructuredList
                    renderLabel={(val, key) => {
                        if (key === 'capital.repaymentTreshold') {
                            return (
                                <Tooltip
                                    isContainerHovered
                                    content={i18n.get('capital.minimumRepaymentDaysToRepayFinancing', { values: { days: repaymentFrequency } })}
                                >
                                    <span>
                                        <Typography
                                            className={'adyen-pe-capital-offer-summary__list-label'}
                                            el={TypographyElement.SPAN}
                                            variant={TypographyVariant.CAPTION}
                                        >
                                            {val}
                                        </Typography>
                                    </span>
                                </Tooltip>
                            );
                        }
                        return (
                            <Typography
                                className={'adyen-pe-capital-offer-summary__list-label'}
                                el={TypographyElement.SPAN}
                                variant={TypographyVariant.CAPTION}
                            >
                                {val}
                            </Typography>
                        );
                    }}
                    renderValue={val => (
                        <Typography el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION} stronger>
                            {val}
                        </Typography>
                    )}
                    items={[
                        { key: 'capital.fees', value: i18n.amount(grantOffer.feesAmount.value, grantOffer.feesAmount.currency) },
                        { key: 'capital.totalRepaymentAmount', value: i18n.amount(grantOffer.totalAmount.value, grantOffer.totalAmount.currency) },
                        {
                            key: 'capital.repaymentTreshold',
                            value: i18n.amount(grantOffer.thresholdAmount.value, grantOffer.thresholdAmount.currency),
                        },
                        { key: 'capital.repaymentRatePercentage', value: grantOffer.repaymentRate },
                        { key: 'capital.expectedRepaymentPeriod', value: grantOffer.expectedRepaymentPeriodDays },
                        { key: 'capital.maximumRepaymentPeriod', value: grantOffer.maximumRepaymentPeriodDays },
                        { key: 'capital.balanceAccount', value: 'TODO balance account' },
                    ]}
                />
            </div>
            <div className="adyen-pe-capital-offer-selection__buttons">
                <Button variant={ButtonVariant.SECONDARY} onClick={onBack}>
                    {i18n.get('capital.back')}
                </Button>
                <Button variant={ButtonVariant.PRIMARY} onClick={onOfferSigned} disabled={signOfferMutation.isLoading}>
                    {i18n.get('capital.reviewOffer')}
                </Button>
            </div>
        </div>
    );
};

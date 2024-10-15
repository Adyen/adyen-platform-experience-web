import InfoBox from '../../../../internal/InfoBox';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { IGrant, IGrantOfferResponseDTO } from '../../../../../types';
import { useCallback, useMemo } from 'preact/hooks';
import { calculateMaximumRepaymentPeriodInMonths, getExpectedRepaymentDate } from '../utils/utils';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import StructuredList from '../../../../internal/StructuredList';
import './CapitalOfferSummary.scss';
import Button from '../../../../internal/Button/Button';
import { ButtonVariant } from '../../../../internal/Button/types';
import useMutation from '../../../../../hooks/useMutation/useMutation';
import { useAuthContext } from '../../../../../core/Auth';
import { Tooltip } from '../../../../internal/Tooltip/Tooltip';
import { EMPTY_OBJECT } from '../../../../../utils';

export const CapitalOfferSummary = ({
    grantOffer,
    repaymentFrequency,
    onBack,
    onRequestFunds,
}: {
    grantOffer: IGrantOfferResponseDTO;
    repaymentFrequency: number;
    onBack: () => void;
    onRequestFunds?: (data: IGrant) => void;
}) => {
    const { i18n } = useCoreContext();
    const expectedRepaymentDate = useMemo(() => {
        const date = getExpectedRepaymentDate(grantOffer.expectedRepaymentPeriodDays);
        return date ? i18n.date(date, { month: 'long' }) : null;
    }, [grantOffer, i18n]);

    const { requestFunds, reviewGrantOffer } = useAuthContext().endpoints;

    const requestFundsMutation = useMutation({
        queryFn: requestFunds,
        options: {
            onSuccess: data => onRequestFunds?.(data),
        },
    });
    const reviewGrantOfferMutation = useMutation({
        queryFn: reviewGrantOffer,
        options: {
            onSuccess: data => requestFundsCallback(data.id!),
        },
    });

    const requestFundsCallback = useCallback(
        (id: string) => {
            void requestFundsMutation.mutate(EMPTY_OBJECT, { path: { grantOfferId: id } });
        },
        [requestFundsMutation]
    );

    const onRequestFundsHandler = useCallback(() => {
        grantOffer.id
            ? requestFundsCallback(grantOffer.id)
            : reviewGrantOfferMutation.mutate({ body: { amount: 10, currency: '' }, contentType: 'application/json' });
    }, [grantOffer.id, requestFundsCallback, reviewGrantOfferMutation]);

    const maximumRepaymentPeriod = useMemo(
        () => calculateMaximumRepaymentPeriodInMonths(grantOffer.maximumRepaymentPeriodDays),
        [grantOffer.maximumRepaymentPeriodDays]
    );
    return (
        <div className="adyen-pe-capital-offer-summary">
            <InfoBox className="adyen-pe-capital-offer-summary__grant-summary">
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
            <StructuredList
                classNames="adyen-pe-capital-offer-summary__details"
                renderLabel={(val, key) => {
                    if (key === 'capital.repaymentThreshold') {
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
                        key: 'capital.repaymentThreshold',
                        value: i18n.amount(grantOffer.thresholdAmount.value, grantOffer.thresholdAmount.currency),
                    },
                    {
                        key: 'capital.repaymentRatePercentage',
                        value: `${grantOffer.repaymentRate}% ${i18n.get('capital.daily')}`,
                    },
                    { key: 'capital.expectedRepaymentPeriod', value: `${grantOffer.expectedRepaymentPeriodDays} ${i18n.get('capital.days')}` },
                    {
                        key: 'capital.maximumRepaymentPeriod',
                        value: maximumRepaymentPeriod
                            ? `${calculateMaximumRepaymentPeriodInMonths(grantOffer.maximumRepaymentPeriodDays)} ${i18n.get(
                                  maximumRepaymentPeriod > 1 ? 'capital.months' : 'capital.month'
                              )}`
                            : null,
                    },
                    { key: 'capital.balanceAccount', value: 'TODO balance account' },
                ]}
            />
            <div className="adyen-pe-capital-offer-summary__buttons">
                <Button variant={ButtonVariant.SECONDARY} onClick={onBack}>
                    {i18n.get('capital.back')}
                </Button>
                <Button
                    variant={ButtonVariant.PRIMARY}
                    onClick={onRequestFundsHandler}
                    disabled={reviewGrantOfferMutation.isLoading || reviewGrantOfferMutation.isLoading}
                >
                    {i18n.get('capital.requestFunds')}
                </Button>
            </div>
        </div>
    );
};

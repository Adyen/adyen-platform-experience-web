import Slider from '../../../../internal/Slider';
import InfoBox from '../../../../internal/InfoBox';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import StructuredList from '../../../../internal/StructuredList';
import Button from '../../../../internal/Button/Button';
import { ButtonVariant } from '../../../../internal/Button/types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { useEffect } from 'preact/compat';
import { useAuthContext } from '../../../../../core/Auth';
import useMutation from '../../../../../hooks/useMutation/useMutation';
import { parseDate } from '../../../../../utils';
import { DAY_MS } from '../../../../internal/Calendar/calendar/constants';
import { IDynamicOfferConfig, IGrantOfferResponseDTO } from '../../../../../types';
import './CapitalOfferSelection.scss';

type CapitalOfferSelectionProps = {
    config: IDynamicOfferConfig | undefined;
    onBack: () => void;
};

const dateStartUTCTimestampOffset = (date: Date | number | string, numberOfDays = 0) => {
    return new Date(new Date(date).setUTCHours(0, 0, 0, 0) + Math.floor(numberOfDays) * DAY_MS);
};

const REPAYMENT_FREQUENCY = 30;

const LoadingSkeleton = () => (
    <div className="adyen-pe-capital-offer-selection__loading-container">
        {[...Array(4)].map((_, index) => (
            <div key={index} className="adyen-pe-capital-offer-selection__loading-skeleton"></div>
        ))}
    </div>
);

const InformationDisplay = ({ data }: { data: IGrantOfferResponseDTO }) => {
    const { i18n } = useCoreContext();
    const formattedThresholdAmount = useMemo(() => {
        return data
            ? `${i18n.amount(data.thresholdAmount.value, data.thresholdAmount.currency)} ${i18n.get(
                  'capital.every'
              )} ${REPAYMENT_FREQUENCY} ${i18n.get('capital.repaymentDays')}`
            : '';
    }, [data, i18n]);
    const expectedRepaymentDate = useMemo(() => {
        const date = data && parseDate(dateStartUTCTimestampOffset(new Date(), data.expectedRepaymentPeriodDays));
        if (date) return i18n.date(date, { month: 'long' });
        return null;
    }, [data, i18n]);
    return (
        <div className="adyen-pe-capital-offer-selection__information">
            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                {i18n.get('capital.yourMinimumRepaymentWillBe')}{' '}
                <Typography variant={TypographyVariant.BODY} el={TypographyElement.SPAN} strongest>
                    {formattedThresholdAmount}
                </Typography>{' '}
                {i18n.get('capital.until')} {expectedRepaymentDate}
            </Typography>
            <StructuredList
                renderValue={val => (
                    <Typography el={TypographyElement.SPAN} stronger variant={TypographyVariant.CAPTION}>
                        {val}
                    </Typography>
                )}
                renderLabel={val => (
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION}>
                        {val}
                    </Typography>
                )}
                items={[
                    { key: 'capital.fees', value: i18n.amount(data.feesAmount.value, data.feesAmount.currency) },
                    { key: 'capital.repaymentRate', value: `${data.repaymentRate}% ${i18n.get('capital.daily')}` },
                    { key: 'capital.expectedRepaymentPeriod', value: data.expectedRepaymentPeriodDays },
                ]}
            />
        </div>
    );
};

export const CapitalOfferSelection = ({ config, onBack }: CapitalOfferSelectionProps) => {
    const { i18n } = useCoreContext();
    const [requestedValue, setRequestedValue] = useState<number | undefined>(config?.minAmount.value);
    const currency = useMemo(() => config?.minAmount.currency, [config?.minAmount.currency]);

    const { reviewGrantOffer, getDynamicGrantOffer } = useAuthContext().endpoints;
    const getDynamicGrantOfferMutation = useMutation({
        queryFn: getDynamicGrantOffer,
    });

    const reviewOfferMutation = useMutation({
        queryFn: reviewGrantOffer,
    });

    const onReview = useCallback(
        () =>
            reviewOfferMutation.mutate({
                body: {
                    amount: getDynamicGrantOfferMutation.data?.grantAmount.value || requestedValue!,
                    currency: getDynamicGrantOfferMutation.data?.grantAmount.currency || currency!,
                },
                contentType: 'application/json',
            }),
        [
            currency,
            getDynamicGrantOfferMutation.data?.grantAmount.currency,
            getDynamicGrantOfferMutation.data?.grantAmount.value,
            requestedValue,
            reviewOfferMutation,
        ]
    );

    const getDynamicGrantOfferMutationCallback = getDynamicGrantOfferMutation.mutate;

    const getOffer = useCallback(
        (amount: number) => getDynamicGrantOfferMutationCallback({}, { query: { amount, currency: currency! } }),
        [currency, getDynamicGrantOfferMutationCallback]
    );
    const handleSliderRelease = (event: Event) => getOffer((event.target as any).value);

    useEffect(() => {
        if (config) {
            setRequestedValue(config.minAmount.value);
            void getOffer(config.minAmount.value);
        }
    }, [config, getOffer]);

    return (
        <div>
            {/* TODO: replace this with Capital Slider component */}
            <p>{'How much money do you need?'}</p>
            {requestedValue && config && <p>{i18n.amount(requestedValue, config.minAmount.currency)}</p>}
            <div>
                <Slider
                    min={config?.minAmount.value}
                    max={config?.maxAmount.value}
                    step={config?.step}
                    value={requestedValue}
                    onMouseUp={handleSliderRelease}
                    onTouchEnd={handleSliderRelease}
                    onKeyUp={handleSliderRelease}
                    onChange={event => {
                        setRequestedValue((event.target as any).value);
                    }}
                />
            </div>
            <InfoBox className="adyen-pe-capital-offer-selection__details">
                {!getDynamicGrantOfferMutation.data || getDynamicGrantOfferMutation.isLoading ? (
                    <LoadingSkeleton />
                ) : getDynamicGrantOfferMutation.data ? (
                    <InformationDisplay data={getDynamicGrantOfferMutation.data} />
                ) : null}
            </InfoBox>
            <div className="adyen-pe-capital-offer-selection__buttons">
                <Button variant={ButtonVariant.SECONDARY} onClick={onBack}>
                    {i18n.get('capital.back')}
                </Button>
                <Button variant={ButtonVariant.PRIMARY} onClick={onReview} disabled={reviewOfferMutation.isLoading}>
                    {i18n.get('capital.reviewOffer')}
                </Button>
            </div>
        </div>
    );
};

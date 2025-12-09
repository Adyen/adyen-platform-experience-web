import InfoBox from '../../../../internal/InfoBox';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import StructuredList from '../../../../internal/StructuredList';
import Button from '../../../../internal/Button/Button';
import { ButtonVariant } from '../../../../internal/Button/types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useAnalyticsContext from '../../../../../core/Context/analytics/useAnalyticsContext';
import { useDurationEvent } from '../../../../../hooks/useAnalytics/useDurationEvent';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { useConfigContext } from '../../../../../core/ConfigContext';
import useMutation from '../../../../../hooks/useMutation/useMutation';
import { IDynamicOffersConfig, IGrantOfferResponseDTO } from '../../../../../types';
import './CapitalOfferSelection.scss';
import { sharedCapitalOfferAnalyticsEventProperties } from '../CapitalOffer/constants';
import { getExpectedRepaymentDate, getPercentage } from '../utils/utils';
import CapitalSlider from '../../../../internal/CapitalSlider';
import { CapitalErrorMessageDisplay } from '../utils/CapitalErrorMessageDisplay';
import { calculateSliderAdjustedMidValue } from '../../../../internal/Slider/Slider';
import { CAPITAL_REPAYMENT_FREQUENCY } from '../../../../constants';
import { debounce } from '../../../../utils/utils';

type CapitalOfferSelectionProps = {
    dynamicOffersConfig: IDynamicOffersConfig | undefined;
    dynamicOffersConfigError?: Error;
    emptyGrantOffer: boolean;
    onContactSupport?: () => void;
    onOfferDismiss?: () => void;
    onOfferSelect: (data: IGrantOfferResponseDTO) => void;
    requestedAmount: number | undefined;
};

const sharedAnalyticsEventProperties = {
    ...sharedCapitalOfferAnalyticsEventProperties,
    subCategory: 'Business financing offer',
} as const;

const LoadingSkeleton = () => (
    <div className="adyen-pe-capital-offer-selection__loading-container">
        {[...Array(4)].map((_, index) => (
            <div key={index} className="adyen-pe-capital-offer-selection__loading-skeleton"></div>
        ))}
    </div>
);

const InformationDisplay = ({ data }: { data: IGrantOfferResponseDTO }) => {
    const { i18n } = useCoreContext();
    const expectedRepaymentDate = useMemo(() => {
        const date = data.expectedRepaymentPeriodDays && getExpectedRepaymentDate(data.expectedRepaymentPeriodDays);
        if (date) return i18n.date(date, { month: 'long' });
        return null;
    }, [data, i18n]);
    return (
        <div className="adyen-pe-capital-offer-selection__information">
            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} wide={true}>
                {expectedRepaymentDate &&
                    i18n.get('capital.offer.common.repaymentInfo', {
                        values: {
                            amount: i18n.amount(data.thresholdAmount.value, data.thresholdAmount.currency),
                            days: CAPITAL_REPAYMENT_FREQUENCY,
                            date: expectedRepaymentDate,
                        },
                    })}
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
                    { key: 'capital.common.fields.fees', value: i18n.amount(data.feesAmount.value, data.feesAmount.currency) },
                    {
                        key: 'capital.common.fields.dailyRepaymentRate',
                        value: `${i18n.get('capital.common.values.percentage', {
                            values: { percentage: getPercentage(data.repaymentRate) },
                        })}`,
                    },
                    {
                        key: 'capital.common.fields.expectedRepaymentPeriod',
                        value: i18n.get('capital.common.values.numberOfDays', { values: { days: data.expectedRepaymentPeriodDays } }),
                    },
                ]}
            />
        </div>
    );
};

export const CapitalOfferSelection = ({
    dynamicOffersConfig,
    dynamicOffersConfigError,
    emptyGrantOffer,
    onContactSupport,
    onOfferDismiss,
    onOfferSelect,
    requestedAmount,
}: CapitalOfferSelectionProps) => {
    const { i18n } = useCoreContext();
    const userEvents = useAnalyticsContext();

    const initialValue = useMemo(() => {
        if (dynamicOffersConfig)
            return calculateSliderAdjustedMidValue(
                dynamicOffersConfig.minAmount.value,
                dynamicOffersConfig.maxAmount.value,
                dynamicOffersConfig.step
            );
        return undefined;
    }, [dynamicOffersConfig]);

    const [requestedValue, setRequestedValue] = useState<number | undefined>(undefined);

    const currency = useMemo(() => dynamicOffersConfig?.minAmount.currency, [dynamicOffersConfig?.minAmount.currency]);

    const { createGrantOffer, getDynamicGrantOffer } = useConfigContext().endpoints;
    const getDynamicGrantOfferMutation = useMutation({
        queryFn: getDynamicGrantOffer,
        options: {
            retry: 1,
            shouldRetry: useCallback((error: any) => {
                return error.status === 500;
            }, []),
            onSettled: useCallback(() => {
                setIsLoading(false);
            }, []),
        },
    });

    const reviewOfferMutation = useMutation({
        queryFn: createGrantOffer,
        options: {
            onSuccess: data => onOfferSelect(data),
        },
    });

    const onReview = useCallback(() => {
        try {
            void reviewOfferMutation.mutate({
                body: {
                    amount: getDynamicGrantOfferMutation.data?.grantAmount.value || requestedValue!,
                    currency: getDynamicGrantOfferMutation.data?.grantAmount.currency || currency!,
                },
                contentType: 'application/json',
            });
        } finally {
            userEvents.addEvent?.('Clicked button', { ...sharedAnalyticsEventProperties, label: 'Review offer' });
        }
    }, [currency, getDynamicGrantOfferMutation.data, requestedValue, reviewOfferMutation, userEvents]);

    const getOffer = useCallback(
        (amount: number) => getDynamicGrantOfferMutation.mutate({}, { query: { amount, currency: currency! } }),
        [currency, getDynamicGrantOfferMutation]
    );

    const [isLoading, setIsLoading] = useState(false);

    const debouncedGetOfferCall = useMemo(() => debounce(getOffer, 300), [getOffer]);

    const onChangeHandler = useCallback(
        (val: number) => {
            debouncedGetOfferCall.cancel();
            setIsLoading(true);
            setRequestedValue(val);
        },
        [debouncedGetOfferCall]
    );

    const handleSliderRelease = useCallback(
        (val: number) => {
            try {
                return debouncedGetOfferCall(val);
            } finally {
                userEvents.addEvent?.('Changed capital offer slider', {
                    ...sharedAnalyticsEventProperties,
                    label: 'Slider changed',
                    value: val,
                });
            }
        },
        [debouncedGetOfferCall, userEvents]
    );

    useEffect(() => {
        if (dynamicOffersConfig && !getDynamicGrantOfferMutation.data && !requestedValue) {
            setRequestedValue(prev =>
                !prev ? (requestedAmount ? Number(requestedAmount) : initialValue || dynamicOffersConfig.minAmount.value) : prev
            );
            void getOffer(requestedValue || initialValue || dynamicOffersConfig.minAmount.value);
        }
    }, [dynamicOffersConfig, getDynamicGrantOfferMutation.data, getOffer, initialValue, requestedAmount, requestedValue]);

    const loadingButtonState = useMemo(
        () => reviewOfferMutation.isLoading || getDynamicGrantOfferMutation.isLoading || isLoading,
        [getDynamicGrantOfferMutation.isLoading, isLoading, reviewOfferMutation.isLoading]
    );

    useDurationEvent(sharedAnalyticsEventProperties);

    return (
        <div className="adyen-pe-capital-offer-selection">
            {reviewOfferMutation.error || getDynamicGrantOfferMutation.error || emptyGrantOffer || dynamicOffersConfigError ? (
                <CapitalErrorMessageDisplay
                    error={reviewOfferMutation.error || getDynamicGrantOfferMutation.error || dynamicOffersConfigError}
                    onBack={onOfferDismiss}
                    onContactSupport={onContactSupport}
                    emptyGrantOffer={emptyGrantOffer}
                />
            ) : (
                <>
                    {dynamicOffersConfig && (
                        <CapitalSlider
                            value={requestedValue}
                            dynamicOffersConfig={dynamicOffersConfig}
                            onValueChange={onChangeHandler}
                            onRelease={handleSliderRelease}
                        />
                    )}
                    <InfoBox className="adyen-pe-capital-offer-selection__details">
                        {!getDynamicGrantOfferMutation.data || getDynamicGrantOfferMutation.isLoading || isLoading ? (
                            <LoadingSkeleton />
                        ) : getDynamicGrantOfferMutation.data ? (
                            <InformationDisplay data={getDynamicGrantOfferMutation.data} />
                        ) : null}
                    </InfoBox>
                    <div className="adyen-pe-capital-offer-selection__buttons">
                        {onOfferDismiss && (
                            <Button variant={ButtonVariant.SECONDARY} onClick={onOfferDismiss}>
                                {i18n.get('capital.common.actions.goBack')}
                            </Button>
                        )}
                        <Button
                            variant={ButtonVariant.PRIMARY}
                            state={loadingButtonState ? 'loading' : undefined}
                            onClick={onReview}
                            disabled={reviewOfferMutation.isLoading || !dynamicOffersConfig?.minAmount}
                            aria-label={i18n.get('capital.offer.selection.actions.reviewOffer')}
                        >
                            {i18n.get(
                                loadingButtonState
                                    ? 'capital.offer.selection.actions.reviewOffer.states.loading'
                                    : 'capital.offer.selection.actions.reviewOffer'
                            )}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

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
import { IDynamicOfferConfig, IGrantOfferResponseDTO } from '../../../../../types';
import './CapitalOfferSelection.scss';
import { debounce, getExpectedRepaymentDate, getPaymentRatePercentage } from '../utils/utils';
import CapitalSlider from '../../../../internal/CapitalSlider';
import { CapitalErrorMessageDisplay } from '../utils/CapitalErrorMessageDisplay';
import { calculateSliderAdjustedMidValue } from '../../../../internal/Slider/Slider';
import { EMPTY_OBJECT } from '../../../../../utils';

type CapitalOfferSelectionProps = {
    config: IDynamicOfferConfig | undefined;
    onBack: () => void;
    onOfferSelect: (data: IGrantOfferResponseDTO) => void;
    repaymentFrequency: number;
    requestedAmount: number | undefined;
    emptyGrantOffer: boolean;
    onContactSupport: (() => void) | undefined;
    dynamicConfigError?: Error;
};

const LoadingSkeleton = () => (
    <div className="adyen-pe-capital-offer-selection__loading-container">
        {[...Array(4)].map((_, index) => (
            <div key={index} className="adyen-pe-capital-offer-selection__loading-skeleton"></div>
        ))}
    </div>
);

const InformationDisplay = ({ data, repaymentFrequency }: { data: IGrantOfferResponseDTO; repaymentFrequency: number }) => {
    const { i18n } = useCoreContext();
    const expectedRepaymentDate = useMemo(() => {
        const date = data.expectedRepaymentPeriodDays && getExpectedRepaymentDate(data.expectedRepaymentPeriodDays);
        if (date) return i18n.date(date, { month: 'long' });
        return null;
    }, [data, i18n]);
    return (
        <div className="adyen-pe-capital-offer-selection__information">
            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} wide={true}>
                {i18n.get('capital.yourMinimumRepaymentWillBeXEveryXDaysUntilX.part1')}
                <Typography variant={TypographyVariant.BODY} el={TypographyElement.SPAN} strongest>
                    {i18n.get('capital.yourMinimumRepaymentWillBeXEveryXDaysUntilX.part2', {
                        values: {
                            amount: i18n.amount(data.thresholdAmount.value, data.thresholdAmount.currency),
                            days: repaymentFrequency,
                        },
                    })}
                </Typography>{' '}
                {expectedRepaymentDate &&
                    i18n.get('capital.yourMinimumRepaymentWillBeXEveryXDaysUntilX.part3', {
                        values: {
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
                    { key: 'capital.fees', value: i18n.amount(data.feesAmount.value, data.feesAmount.currency) },
                    {
                        key: 'capital.dailyRepaymentRate',
                        value: `${i18n.get('capital.xPercent', {
                            values: { percentage: getPaymentRatePercentage(data.repaymentRate) },
                        })}`,
                    },
                    {
                        key: 'capital.expectedRepaymentPeriod',
                        value: i18n.get('capital.xDays', { values: { days: data.expectedRepaymentPeriodDays } }),
                    },
                ]}
            />
        </div>
    );
};

export const CapitalOfferSelection = ({
    config,
    onBack,
    repaymentFrequency,
    requestedAmount,
    onOfferSelect,
    emptyGrantOffer,
    onContactSupport,
    dynamicConfigError,
}: CapitalOfferSelectionProps) => {
    const { i18n } = useCoreContext();

    const initialValue = useMemo(() => {
        if (config) return calculateSliderAdjustedMidValue(config.minAmount.value, config.maxAmount.value, config.step);
        return undefined;
    }, [config]);

    const [requestedValue, setRequestedValue] = useState<number | undefined>(requestedAmount ? Number(requestedAmount) : initialValue);

    const currency = useMemo(() => config?.minAmount.currency, [config?.minAmount.currency]);

    const { createGrantOffer, getDynamicGrantOffer } = useAuthContext().endpoints;
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
        void reviewOfferMutation.mutate({
            body: {
                amount: getDynamicGrantOfferMutation.data?.grantAmount.value || requestedValue!,
                currency: getDynamicGrantOfferMutation.data?.grantAmount.currency || currency!,
            },
            contentType: 'application/json',
        });
    }, [currency, getDynamicGrantOfferMutation.data, requestedValue, reviewOfferMutation]);

    const getOffer = useCallback(
        (amount: number) => getDynamicGrantOfferMutation.mutate({}, { query: { amount, currency: currency! } }),
        [currency, getDynamicGrantOfferMutation]
    );

    const [isLoading, setIsLoading] = useState(false);

    const debouncedGetOfferCall = debounce(getOffer, 300);

    const onChangeHandler = useCallback(
        (val: number) => {
            debouncedGetOfferCall.cancel();
            setIsLoading(true);
            setRequestedValue(val);
        },
        [debouncedGetOfferCall]
    );

    const handleSliderRelease = (val: number) => debouncedGetOfferCall(val);

    useEffect(() => {
        if (config) {
            setRequestedValue(prev => (!prev ? initialValue || config.minAmount.value : prev));
            !getDynamicGrantOfferMutation.data && void getOffer(requestedValue || initialValue || config.minAmount.value);
        }
    }, [config, getDynamicGrantOfferMutation.data, getOffer, initialValue, requestedValue]);

    const loadingButtonState = useMemo(
        () => reviewOfferMutation.isLoading || getDynamicGrantOfferMutation.isLoading || isLoading,
        [getDynamicGrantOfferMutation.isLoading, isLoading, reviewOfferMutation.isLoading]
    );

    return (
        <div className="adyen-pe-capital-offer-selection">
            {reviewOfferMutation.error || getDynamicGrantOfferMutation.error || emptyGrantOffer || dynamicConfigError ? (
                <CapitalErrorMessageDisplay
                    error={reviewOfferMutation.error}
                    onBack={onBack}
                    onContactSupport={onContactSupport}
                    emptyGrantOffer={emptyGrantOffer}
                />
            ) : (
                <>
                    {config && (
                        <CapitalSlider
                            value={requestedValue}
                            dynamicCapitalOffer={config}
                            onValueChange={onChangeHandler}
                            onRelease={handleSliderRelease}
                        />
                    )}
                    <InfoBox className="adyen-pe-capital-offer-selection__details">
                        {!getDynamicGrantOfferMutation.data || getDynamicGrantOfferMutation.isLoading || isLoading ? (
                            <LoadingSkeleton />
                        ) : getDynamicGrantOfferMutation.data ? (
                            <InformationDisplay data={getDynamicGrantOfferMutation.data} repaymentFrequency={repaymentFrequency} />
                        ) : null}
                    </InfoBox>
                    <div className="adyen-pe-capital-offer-selection__buttons">
                        <Button variant={ButtonVariant.SECONDARY} onClick={onBack}>
                            {i18n.get('back')}
                        </Button>
                        <Button
                            variant={ButtonVariant.PRIMARY}
                            state={loadingButtonState ? 'loading' : undefined}
                            onClick={onReview}
                            disabled={reviewOfferMutation.isLoading || !config?.minAmount}
                        >
                            {i18n.get(loadingButtonState ? 'loading' : 'capital.reviewOffer')}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

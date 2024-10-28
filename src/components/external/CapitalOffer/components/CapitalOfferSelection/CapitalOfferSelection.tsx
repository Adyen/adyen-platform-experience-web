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
import { getCapitalErrorMessage } from '../../../../utils/capital/getCapitalErrorMessage';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import { ErrorMessageDisplay } from '../../../../internal/ErrorMessageDisplay/ErrorMessageDisplay';

type CapitalOfferSelectionProps = {
    config: IDynamicOfferConfig | undefined;
    onBack: () => void;
    onReviewOffer: (data?: IGrantOfferResponseDTO) => void;
    repaymentFrequency: number;
    requestedAmount: number | undefined;
    emptyGrantOffer: boolean;
    onContactSupport: (() => void) | undefined;
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
    const formattedThresholdAmount = useMemo(() => {
        return data
            ? `${i18n.amount(data.thresholdAmount.value, data.thresholdAmount.currency)} ${i18n.get(
                  'capital.every'
              )} ${repaymentFrequency} ${i18n.get('capital.repaymentDays')}`
            : '';
    }, [data, i18n, repaymentFrequency]);
    const expectedRepaymentDate = useMemo(() => {
        const date = data.expectedRepaymentPeriodDays && getExpectedRepaymentDate(data.expectedRepaymentPeriodDays);
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
                    { key: 'capital.repaymentRate', value: `${getPaymentRatePercentage(data.repaymentRate)}% ${i18n.get('capital.daily')}` },
                    { key: 'capital.expectedRepaymentPeriod', value: `${data.expectedRepaymentPeriodDays} ${i18n.get('capital.days')}` },
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
    onReviewOffer,
    emptyGrantOffer,
    onContactSupport,
}: CapitalOfferSelectionProps) => {
    const { i18n } = useCoreContext();
    const [requestedValue, setRequestedValue] = useState<number | undefined>(Number(requestedAmount) || config?.minAmount.value);
    const currency = useMemo(() => config?.minAmount.currency, [config?.minAmount.currency]);

    const { reviewGrantOffer, getDynamicGrantOffer } = useAuthContext().endpoints;
    const getDynamicGrantOfferMutation = useMutation({
        queryFn: getDynamicGrantOffer,
        options: {
            onSettled: useCallback(() => {
                setIsLoading(false);
            }, []),
        },
    });

    const reviewOfferMutation = useMutation({
        queryFn: reviewGrantOffer,
        options: {
            onSuccess: data => onReviewOffer(data),
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

    const getDynamicGrantOfferMutationCallback = getDynamicGrantOfferMutation.mutate;

    const getOffer = useCallback(
        (amount: number) => getDynamicGrantOfferMutationCallback({}, { query: { amount, currency: currency! } }),
        [currency, getDynamicGrantOfferMutationCallback]
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
            setRequestedValue(prev => (!prev ? config.minAmount.value : prev));
            !getDynamicGrantOfferMutation.data && void getOffer(requestedValue || config.minAmount.value);
        }
    }, [config, getDynamicGrantOfferMutation.data, getOffer, requestedValue]);

    return (
        <div className="adyen-pe-capital-offer-selection">
            {reviewOfferMutation.error || emptyGrantOffer ? (
                <ErrorMessageDisplay
                    absolutePosition={false}
                    outlined={false}
                    withImage
                    onContactSupport={onContactSupport}
                    onGoBack={onBack}
                    {...getCapitalErrorMessage(reviewOfferMutation.error as AdyenPlatformExperienceError)}
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
                </>
            )}
            {!reviewOfferMutation.error && (
                <div className="adyen-pe-capital-offer-selection__buttons">
                    <Button variant={ButtonVariant.SECONDARY} onClick={onBack}>
                        {i18n.get('capital.back')}
                    </Button>
                    <Button variant={ButtonVariant.PRIMARY} onClick={onReview} disabled={reviewOfferMutation.isLoading || !config?.minAmount}>
                        {i18n.get('capital.reviewOffer')}
                    </Button>
                </div>
            )}
        </div>
    );
};

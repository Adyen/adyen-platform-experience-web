import Typography from '@integration-components/ui-components-preact/Typography/Typography';
import { TypographyElement, TypographyVariant } from '@integration-components/ui-components-preact/Typography/types';
import StructuredList from '@integration-components/ui-components-preact/StructuredList';
import Button from '@integration-components/ui-components-preact/Button/Button';
import Card from '@integration-components/ui-components-preact/Card/Card';
import { ButtonVariant, IDynamicOffersConfig, IGrantOfferResponseDTO } from '@integration-components/types';
import { useCoreContext, useConfigContext, useEventDispatcherContext } from '@integration-components/core/preact';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import useMutation from '@integration-components/hooks-preact/useMutation/useMutation';
import { useTimezoneAwareDateFormatting } from '@integration-components/hooks-preact';
import { DATE_FORMAT_CAPITAL_OVERVIEW, EMPTY_OBJECT, debounce } from '@integration-components/utils';
import './CapitalOfferSelection.scss';
import { sharedCapitalOfferAnalyticsEventProperties } from '../CapitalOffer/constants';
import { getMaximumRepaymentDate, getPercentage } from '../utils/utils';
import CapitalSlider from '../../../internal/CapitalSlider';
import { CapitalErrorMessageDisplay } from '../utils/CapitalErrorMessageDisplay';
import { calculateSliderAdjustedMidValue } from '@integration-components/ui-components-preact/Slider/Slider';
import { TermSelector } from '../TermSelector';
import { useFormatTermLabel } from '../hooks/useFormatTermLabel';

const DEFAULT_TERM = 180;

const sharedAnalyticsEventProperties = {
    ...sharedCapitalOfferAnalyticsEventProperties,
    subCategory: 'Business financing offer',
} as const;

const LoadingSkeleton = ({ hasSingleTerm }: { hasSingleTerm: boolean }) => (
    <div className="adyen-pe-capital-offer-selection__loading-container">
        {[...Array(hasSingleTerm ? 6 : 5)].map((_, index) => (
            <div key={index} className="adyen-pe-capital-offer-selection__loading-skeleton"></div>
        ))}
    </div>
);

const InformationDisplay = ({ data, hasSingleTerm }: { data: IGrantOfferResponseDTO; hasSingleTerm: boolean }) => {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting();
    const maximumRepaymentPeriodDate = useMemo(() => {
        const days = data.maximumRepaymentPeriodDays;
        const date = days && getMaximumRepaymentDate(days);
        return date && dateFormat(date, DATE_FORMAT_CAPITAL_OVERVIEW);
    }, [data.maximumRepaymentPeriodDays, dateFormat]);

    const formatTermLabel = useFormatTermLabel();

    return (
        <div className="adyen-pe-capital-offer-selection__information">
            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION} stronger>
                {i18n.get('capital.common.termsTitle')}
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
                        key: 'capital.common.fields.totalRepaymentAmount',
                        value: i18n.amount(data.totalAmount.value, data.totalAmount.currency),
                    },
                    {
                        key: 'capital.common.fields.dailyRepaymentRate',
                        value: i18n.get('capital.common.values.percentage', {
                            values: { percentage: getPercentage(data.repaymentRate) },
                        }),
                    },
                    ...(hasSingleTerm
                        ? [
                              {
                                  key: 'capital.common.fields.expectedRepaymentPeriod' as const,
                                  value: formatTermLabel(data.expectedRepaymentPeriodDays),
                              },
                          ]
                        : []),
                    ...(data.maximumRepaymentPeriodDays
                        ? [
                              {
                                  key: 'capital.common.fields.maximumRepaymentDate' as const,
                                  value: maximumRepaymentPeriodDate,
                              },
                          ]
                        : []),
                ]}
            />
        </div>
    );
};

type CapitalOfferSelectionProps = {
    dynamicOffersConfig: IDynamicOffersConfig | undefined;
    dynamicOffersConfigError?: Error;
    emptyGrantOffer: boolean;
    selectedAmount: number | undefined;
    selectedTerm: number | undefined;
    onContactSupport?: () => void;
    onOfferDismiss?: () => void;
    onOfferSelect: (data: IGrantOfferResponseDTO) => void;
    onSelectedAmountChange: (val: number) => void;
    onSelectedTermChange: (term: number) => void;
};

export const CapitalOfferSelection = ({
    dynamicOffersConfig,
    dynamicOffersConfigError,
    emptyGrantOffer,
    selectedAmount,
    selectedTerm,
    onContactSupport,
    onOfferDismiss,
    onOfferSelect,
    onSelectedAmountChange,
    onSelectedTermChange,
}: CapitalOfferSelectionProps) => {
    const { i18n } = useCoreContext();
    const userEvents = useEventDispatcherContext();

    const defaultAmount = useMemo(
        () =>
            dynamicOffersConfig &&
            calculateSliderAdjustedMidValue(dynamicOffersConfig.minAmount.value, dynamicOffersConfig.maxAmount.value, dynamicOffersConfig.step),
        [dynamicOffersConfig]
    );
    const hasInitializedRef = useRef(false);

    const allTerms = useMemo(() => dynamicOffersConfig?.estimatedRepaymentTermsInDays ?? [], [dynamicOffersConfig]);

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

    const termOfferMap = useMemo<Record<number, IGrantOfferResponseDTO>>(() => {
        const offers = getDynamicGrantOfferMutation.data?.offers ?? [];
        return Object.fromEntries(offers.map(offer => [offer.expectedRepaymentPeriodDays, offer]));
    }, [getDynamicGrantOfferMutation.data]);

    const availableTerms = useMemo<number[]>(() => Object.keys(termOfferMap).map(Number), [termOfferMap]);

    useEffect(() => {
        if (allTerms.length > 0 && selectedTerm === undefined) {
            const selectedTerm = availableTerms.includes(DEFAULT_TERM) ? DEFAULT_TERM : availableTerms[0];
            if (selectedTerm) onSelectedTermChange(selectedTerm);
        }
    }, [allTerms, availableTerms, onSelectedTermChange, selectedTerm]);

    useEffect(() => {
        if (availableTerms.length > 0 && selectedTerm !== undefined && !availableTerms.includes(selectedTerm)) {
            const nearest = availableTerms.reduce((prev, curr) => (Math.abs(curr - selectedTerm) < Math.abs(prev - selectedTerm) ? curr : prev));
            onSelectedTermChange(nearest);
        }
    }, [availableTerms, onSelectedTermChange, selectedTerm]);

    const matchedOffer = useMemo<IGrantOfferResponseDTO | undefined>(() => {
        if (!getDynamicGrantOfferMutation.data?.offers || selectedTerm === undefined) return undefined;
        return getDynamicGrantOfferMutation.data.offers.find(offer => offer.expectedRepaymentPeriodDays === selectedTerm);
    }, [getDynamicGrantOfferMutation.data, selectedTerm]);

    const reviewOfferMutation = useMutation({
        queryFn: createGrantOffer,
        options: {
            onSuccess: data => onOfferSelect(data),
        },
    });

    const onReview = useCallback(() => {
        try {
            if (matchedOffer && selectedTerm) {
                void reviewOfferMutation.mutate(
                    {
                        body: {
                            amount: matchedOffer?.grantAmount.value,
                            currency: matchedOffer?.grantAmount.currency,
                            selectedEstimatedRepaymentTermDays: selectedTerm,
                        },
                        contentType: 'application/json',
                    },
                    { query: EMPTY_OBJECT }
                );
            }
        } finally {
            userEvents.addEvent?.('Clicked button', { ...sharedAnalyticsEventProperties, label: 'Review offer' });
        }
    }, [matchedOffer, reviewOfferMutation, selectedTerm, userEvents]);

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
            onSelectedAmountChange(val);
        },
        [debouncedGetOfferCall, onSelectedAmountChange]
    );

    const handleSliderRelease = useCallback(
        (val: number) => {
            try {
                return debouncedGetOfferCall(val);
            } finally {
                userEvents.addEvent?.('Changed capital offer slider', {
                    ...sharedAnalyticsEventProperties,
                    label: 'Slider changed',
                    currency: currency!,
                    value: val,
                });
            }
        },
        [debouncedGetOfferCall, userEvents, currency]
    );

    useEffect(() => {
        if (dynamicOffersConfig && !getDynamicGrantOfferMutation.data && !hasInitializedRef.current) {
            hasInitializedRef.current = true;
            const initialValue = selectedAmount ?? defaultAmount ?? dynamicOffersConfig.minAmount.value;
            if (!selectedAmount) {
                onSelectedAmountChange(initialValue);
            }
            void getOffer(initialValue);
        }
    }, [dynamicOffersConfig, getDynamicGrantOfferMutation.data, getOffer, defaultAmount, selectedAmount, onSelectedAmountChange]);

    const loadingButtonState = useMemo(
        () => reviewOfferMutation.isLoading || getDynamicGrantOfferMutation.isLoading || isLoading,
        [getDynamicGrantOfferMutation.isLoading, isLoading, reviewOfferMutation.isLoading]
    );

    const termsError = !!dynamicOffersConfig && !allTerms.length;

    const isLoadingIndicatorVisible = useMemo(
        () => !matchedOffer || getDynamicGrantOfferMutation.isLoading || isLoading,
        [getDynamicGrantOfferMutation.isLoading, isLoading, matchedOffer]
    );

    const hasSingleTerm = useMemo(() => allTerms.length === 1, [allTerms.length]);

    return (
        <div className="adyen-pe-capital-offer-selection">
            {reviewOfferMutation.error || getDynamicGrantOfferMutation.error || emptyGrantOffer || dynamicOffersConfigError || termsError ? (
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
                            value={selectedAmount}
                            dynamicOffersConfig={dynamicOffersConfig}
                            onValueChange={onChangeHandler}
                            onRelease={handleSliderRelease}
                        />
                    )}
                    {allTerms.length > 1 && (
                        <TermSelector
                            allTerms={allTerms}
                            availableTerms={availableTerms}
                            selectedTerm={selectedTerm}
                            termOfferMap={termOfferMap}
                            isLoadingIndicatorVisible={isLoadingIndicatorVisible}
                            onTermSelect={onSelectedTermChange}
                        />
                    )}
                    <Card filled noOutline noPadding classNameModifiers={['adyen-pe-capital-offer-selection__details']}>
                        {isLoadingIndicatorVisible ? (
                            <LoadingSkeleton hasSingleTerm={hasSingleTerm} />
                        ) : matchedOffer ? (
                            <InformationDisplay data={matchedOffer} hasSingleTerm={hasSingleTerm} />
                        ) : null}
                    </Card>
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

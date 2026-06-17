import Button from '@integration-components/ui-components-preact/Button/Button';
import Card from '@integration-components/ui-components-preact/Card/Card';
import { ButtonVariant, IDynamicOffersConfig, IGrantOfferResponseDTO } from '@integration-components/types';
import { useCoreContext, useConfigContext, useEventDispatcherContext } from '@integration-components/core/preact';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import useMutation from '@integration-components/hooks-preact/useMutation/useMutation';
import { containerQueries, useResponsiveContainer } from '@integration-components/hooks-preact';
import { EMPTY_OBJECT, debounce } from '@integration-components/utils';
import './CapitalOfferSelection.scss';
import { sharedCapitalOfferAnalyticsEventProperties } from '../CapitalOffer/constants';
import CapitalSlider from '../../../internal/CapitalSlider';
import { CapitalErrorMessageDisplay } from '../utils/CapitalErrorMessageDisplay';
import { calculateSliderAdjustedMidValue, calculateSliderAdjustedMinValue } from '@integration-components/ui-components-preact/Slider/Slider';
import { TermSelector } from '../TermSelector';
import { Fragment } from 'preact';
import { getRelativeToDefault, getValuePercentage } from './utils';
import { CapitalOfferInformation } from '../CapitalOfferInformation/CapitalOfferInformation';
import { CapitalHighlightedFields } from '../CapitalHighlightedFields/CapitalHighlightedFields';
import { EnhancedCapitalState } from '../../../utils/capital/getCapitalState';

const DEFAULT_TERM = 180;

const sharedAnalyticsEventProperties = {
    ...sharedCapitalOfferAnalyticsEventProperties,
    subCategory: 'Business financing offer',
} as const;

const HighlightedFieldsLoadingSkeleton = () => {
    return (
        <>
            <div className="adyen-pe-capital-offer-selection__highlighted-fields-loading-skeleton"></div>
            <div className="adyen-pe-capital-offer-selection__highlighted-fields-loading-spacer"></div>
        </>
    );
};

const OfferInformationLoadingSkeleton = ({ hasSingleTerm }: { hasSingleTerm: boolean }) => {
    const isSmContainer = useResponsiveContainer(containerQueries.down.xs);
    const listItems = [...Array(hasSingleTerm ? 5 : 4)];
    return (
        <>
            <div className="adyen-pe-capital-offer-selection__loading-skeleton"></div>
            <div className="adyen-pe-capital-offer-selection__loading-spacer"></div>
            {isSmContainer ? (
                listItems.map((_, index) => (
                    <Fragment key={index}>
                        <div className="adyen-pe-capital-offer-selection__loading-container">
                            <div className="adyen-pe-capital-offer-selection__loading-skeleton"></div>
                            <div className="adyen-pe-capital-offer-selection__loading-skeleton"></div>
                        </div>
                        <div className="adyen-pe-capital-offer-selection__loading-spacer"></div>
                    </Fragment>
                ))
            ) : (
                <div className="adyen-pe-capital-offer-selection__loading-container">
                    {listItems.map((_, index) => (
                        <div key={index} className="adyen-pe-capital-offer-selection__loading-skeleton"></div>
                    ))}
                </div>
            )}
        </>
    );
};

type CapitalOfferSelectionProps = {
    capitalState: EnhancedCapitalState | undefined;
    capitalStateError?: Error;
    selectedAmount: number | undefined;
    selectedTerm: number | undefined;
    onContactSupport?: () => void;
    onOfferDismiss?: () => void;
    onOfferSelect: (data: IGrantOfferResponseDTO) => void;
    onSelectedAmountChange: (val: number) => void;
    onSelectedTermChange: (term: number) => void;
};

export const CapitalOfferSelection = ({
    capitalState,
    capitalStateError,
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

    const dynamicOffersConfig = useMemo((): IDynamicOffersConfig | undefined => {
        const config = capitalState?.dynamicOffer;
        const minimumRenewalAmountValue = capitalState?.renewableGrants[0]?.renewal?.minimumRenewalAmount?.value;

        if (capitalState?.renewableGrants.length && config && minimumRenewalAmountValue) {
            const minValue = Math.max(minimumRenewalAmountValue, config.minAmount.value);
            const adjustedMinValue = calculateSliderAdjustedMinValue(minValue, config.step);

            return {
                ...config,
                minAmount: { ...config.minAmount, value: adjustedMinValue },
            };
        }

        return config;
    }, [capitalState]);

    const defaultAmount = useMemo(
        () =>
            dynamicOffersConfig &&
            calculateSliderAdjustedMidValue(dynamicOffersConfig.minAmount.value, dynamicOffersConfig.maxAmount.value, dynamicOffersConfig.step),
        [dynamicOffersConfig]
    );
    const hasInitializedRef = useRef(false);

    const allTerms = useMemo(
        () => dynamicOffersConfig?.estimatedRepaymentTermsInDays.toSorted((a, b) => a - b) ?? [],
        [dynamicOffersConfig?.estimatedRepaymentTermsInDays]
    );

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

    const handleTermChange = useCallback(
        (term: number) => {
            const relativeToDefault = getRelativeToDefault(term, DEFAULT_TERM);
            const availableRates = availableTerms.map(t => termOfferMap[t]?.repaymentRate);
            const selectedRate = termOfferMap[term]?.repaymentRate;

            onSelectedTermChange(term);
            userEvents.addEvent?.('Selected repayment term', {
                ...sharedAnalyticsEventProperties,
                allTerms,
                availableTerms,
                selectedTerm: term,
                relativeToDefault,
                availableRates,
                selectedRate,
            });
        },
        [allTerms, availableTerms, termOfferMap, onSelectedTermChange, userEvents]
    );

    const handleUserTermSelect = useCallback((term: number) => handleTermChange(term), [handleTermChange]);

    useEffect(() => {
        if (allTerms.length > 0 && selectedTerm === undefined) {
            const term = availableTerms.includes(DEFAULT_TERM) ? DEFAULT_TERM : availableTerms[0];
            if (term) {
                handleTermChange(term);
            }
        }
    }, [allTerms, availableTerms, handleTermChange, selectedTerm]);

    useEffect(() => {
        if (availableTerms.length > 0 && selectedTerm !== undefined && !availableTerms.includes(selectedTerm)) {
            const nearest = availableTerms.reduce((prev, curr) => (Math.abs(curr - selectedTerm) < Math.abs(prev - selectedTerm) ? curr : prev));
            handleTermChange(nearest);
        }
    }, [availableTerms, handleTermChange, selectedTerm]);

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
                            amount: matchedOffer.grantAmount.value,
                            currency: matchedOffer.grantAmount.currency,
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

    const triggerAmountChangeEvent = useCallback(
        (val: number) => {
            const relativeToDefault = getRelativeToDefault(val, defaultAmount);
            const valuePercentage = getValuePercentage(val, dynamicOffersConfig?.minAmount.value, dynamicOffersConfig?.maxAmount.value);

            userEvents.addEvent?.('Changed capital offer slider', {
                ...sharedAnalyticsEventProperties,
                label: 'Slider changed',
                currency: currency!,
                value: val,
                valuePercentage,
                min: dynamicOffersConfig?.minAmount.value,
                max: dynamicOffersConfig?.maxAmount.value,
                relativeToDefault,
            });
        },
        [dynamicOffersConfig, defaultAmount, userEvents, currency]
    );

    const handleSliderRelease = useCallback(
        (val: number) => {
            try {
                return debouncedGetOfferCall(val);
            } finally {
                triggerAmountChangeEvent(val);
            }
        },
        [debouncedGetOfferCall, triggerAmountChangeEvent]
    );

    useEffect(() => {
        if (dynamicOffersConfig && !getDynamicGrantOfferMutation.data && !hasInitializedRef.current) {
            hasInitializedRef.current = true;
            const initialValue = selectedAmount ?? defaultAmount ?? dynamicOffersConfig.minAmount.value;
            if (!selectedAmount) {
                onSelectedAmountChange(initialValue);
            }
            void getOffer(initialValue);
            triggerAmountChangeEvent(initialValue);
        }
    }, [
        dynamicOffersConfig,
        getDynamicGrantOfferMutation.data,
        getOffer,
        defaultAmount,
        selectedAmount,
        onSelectedAmountChange,
        triggerAmountChangeEvent,
    ]);

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

    const isUnqualified = useMemo(
        () => !capitalStateError && capitalState !== undefined && !capitalState.dynamicOffer,
        [capitalState, capitalStateError]
    );

    const highlightedFields = useMemo(() => {
        const currency = matchedOffer?.grantAmount.currency;
        const newGrantAmount = matchedOffer?.grantAmount.value;
        const existingGrantAmount = capitalState?.renewableGrants[0]?.remainingGrantAmount.value;

        if (!currency || !newGrantAmount || !existingGrantAmount) return [];

        const amountToReceive = newGrantAmount - existingGrantAmount;
        const amountConfig = { minimumFractionDigits: 0 };

        return [
            {
                label: i18n.get('capital.offer.selection.earlyRenewal.newGrantAmount'),
                value: i18n.amount(newGrantAmount, currency, amountConfig),
            },
            {
                value: '-',
            },
            {
                label: i18n.get('capital.offer.selection.earlyRenewal.currentGrantAmount'),
                value: i18n.amount(existingGrantAmount, currency, amountConfig),
            },
            {
                value: '=',
            },
            {
                label: i18n.get('capital.offer.selection.earlyRenewal.amountToReceive'),
                value: i18n.amount(amountToReceive, currency, amountConfig),
            },
        ];
    }, [capitalState, i18n, matchedOffer?.grantAmount.currency, matchedOffer?.grantAmount.value]);

    return (
        <div className="adyen-pe-capital-offer-selection">
            {reviewOfferMutation.error || getDynamicGrantOfferMutation.error || isUnqualified || capitalStateError || termsError ? (
                <CapitalErrorMessageDisplay
                    error={reviewOfferMutation.error || getDynamicGrantOfferMutation.error || capitalStateError}
                    onBack={onOfferDismiss}
                    onContactSupport={onContactSupport}
                    emptyGrantOffer={isUnqualified}
                />
            ) : (
                <>
                    {dynamicOffersConfig && (
                        <>
                            <CapitalSlider
                                value={selectedAmount}
                                dynamicOffersConfig={dynamicOffersConfig}
                                onValueChange={onChangeHandler}
                                onRelease={handleSliderRelease}
                            />
                            {capitalState?.renewableGrants.length ? (
                                isLoadingIndicatorVisible ? (
                                    <HighlightedFieldsLoadingSkeleton />
                                ) : (
                                    <CapitalHighlightedFields fields={highlightedFields} />
                                )
                            ) : null}
                        </>
                    )}
                    {allTerms.length > 1 && (
                        <TermSelector
                            allTerms={allTerms}
                            availableTerms={availableTerms}
                            selectedTerm={selectedTerm}
                            termOfferMap={termOfferMap}
                            isLoadingIndicatorVisible={isLoadingIndicatorVisible}
                            onTermSelect={handleUserTermSelect}
                        />
                    )}
                    <Card filled noOutline noPadding classNameModifiers={['adyen-pe-capital-offer-selection__details']}>
                        {isLoadingIndicatorVisible ? (
                            <OfferInformationLoadingSkeleton hasSingleTerm={hasSingleTerm} />
                        ) : matchedOffer ? (
                            <CapitalOfferInformation data={matchedOffer} hasSingleTerm={hasSingleTerm} />
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
                            disabled={reviewOfferMutation.isLoading || !dynamicOffersConfig?.minAmount || !matchedOffer}
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

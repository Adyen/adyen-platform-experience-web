import Button from '@integration-components/ui-components-preact/Button/Button';
import Card from '@integration-components/ui-components-preact/Card/Card';
import { ButtonVariant, IGrantOfferResponseDTO } from '@integration-components/types';
import { useCoreContext, useConfigContext, useEventDispatcherContext } from '@integration-components/core/preact';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import useMutation from '@integration-components/hooks-preact/useMutation/useMutation';
import { containerQueries, useResponsiveContainer } from '@integration-components/hooks-preact';
import { EMPTY_OBJECT, debounce } from '@integration-components/utils';
import './CapitalOfferSelection.scss';
import {
    getCreateGrantOfferBody,
    DEFAULT_TERM,
    DYNAMIC_OFFER_DEBOUNCE_MS,
    DYNAMIC_OFFER_RETRY_COUNT,
    EnhancedCapitalState,
    getAvailableTerms,
    getEstimatedTerms,
    getOfferForTerm,
    getRelativeToDefault,
    getDynamicOfferConfig,
    getPercentageOfRange,
    getOffersByTerm,
    adjustSelectedTerm,
    sharedCapitalOfferAnalyticsEventProperties,
    getDefaultAmountValue,
    getCurrency,
    getIsEarlyRenewal,
    getDefaultTerm,
} from '@integration-components/capital/domain';
import CapitalSlider from '../../../internal/CapitalSlider';
import { CapitalErrorMessageDisplay } from '../../../internal/CapitalErrorMessageDisplay';
import { TermSelector } from '../TermSelector';
import { Fragment } from 'preact';
import { CapitalOfferInformation } from '../CapitalOfferInformation/CapitalOfferInformation';
import { RenewalHighlightedFields } from '../RenewalHighlightedFields';

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
    const { createGrantOffer, getDynamicGrantOffer } = useConfigContext().endpoints;
    const userEvents = useEventDispatcherContext();

    const isEarlyRenewal = useMemo(() => !!capitalState && getIsEarlyRenewal(capitalState), [capitalState]);
    const dynamicOffersConfig = useMemo(() => capitalState && getDynamicOfferConfig(capitalState), [capitalState]);
    const currency = useMemo(() => dynamicOffersConfig && getCurrency(dynamicOffersConfig), [dynamicOffersConfig]);
    const defaultAmountValue = useMemo(() => dynamicOffersConfig && getDefaultAmountValue(dynamicOffersConfig), [dynamicOffersConfig]);
    const allTerms = useMemo(() => (dynamicOffersConfig ? getEstimatedTerms(dynamicOffersConfig) : []), [dynamicOffersConfig]);

    const hasInitializedRef = useRef(false);
    const [isLoading, setIsLoading] = useState(false);

    const getDynamicGrantOfferMutation = useMutation({
        queryFn: getDynamicGrantOffer,
        options: {
            retry: DYNAMIC_OFFER_RETRY_COUNT,
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

    const offersByTerm = useMemo(() => getOffersByTerm(getDynamicGrantOfferMutation.data?.offers ?? []), [getDynamicGrantOfferMutation.data]);
    const availableTerms = useMemo(() => getAvailableTerms(offersByTerm), [offersByTerm]);
    const matchedOffer = useMemo(() => (selectedTerm ? getOfferForTerm(offersByTerm, selectedTerm) : undefined), [selectedTerm, offersByTerm]);

    const getDynamicOffer = useCallback(
        (amount: number) => getDynamicGrantOfferMutation.mutate({}, { query: { amount, currency: currency! } }),
        [currency, getDynamicGrantOfferMutation]
    );

    const getDebouncedDynamicOffer = useMemo(() => debounce(getDynamicOffer, DYNAMIC_OFFER_DEBOUNCE_MS), [getDynamicOffer]);

    const reviewOffer = useCallback(() => {
        try {
            if (matchedOffer && selectedTerm) {
                void reviewOfferMutation.mutate(
                    {
                        body: getCreateGrantOfferBody(matchedOffer),
                        contentType: 'application/json',
                    },
                    { query: EMPTY_OBJECT }
                );
            }
        } finally {
            userEvents.addEvent?.('Clicked button', { ...sharedAnalyticsEventProperties, label: 'Review offer', isEarlyRenewal });
        }
    }, [matchedOffer, selectedTerm, reviewOfferMutation, userEvents, isEarlyRenewal]);

    const updateTerm = useCallback(
        (term: number) => {
            const relativeToDefault = getRelativeToDefault(term, DEFAULT_TERM);
            const availableRates = availableTerms.map(t => offersByTerm[t]?.repaymentRate);
            const selectedRate = offersByTerm[term]?.repaymentRate;

            onSelectedTermChange(term);
            userEvents.addEvent?.('Selected repayment term', {
                ...sharedAnalyticsEventProperties,
                allTerms,
                availableTerms,
                selectedTerm: term,
                relativeToDefault,
                availableRates,
                selectedRate,
                isEarlyRenewal,
            });
        },
        [availableTerms, offersByTerm, onSelectedTermChange, userEvents, allTerms, isEarlyRenewal]
    );

    useEffect(() => {
        if (allTerms.length > 0 && selectedTerm === undefined) {
            const term = getDefaultTerm(availableTerms);
            if (term !== undefined) {
                updateTerm(term);
            }
        }
    }, [allTerms, availableTerms, updateTerm, selectedTerm]);

    useEffect(() => {
        if (availableTerms.length > 0 && selectedTerm !== undefined && !availableTerms.includes(selectedTerm)) {
            const term = adjustSelectedTerm(availableTerms, selectedTerm);
            if (term !== undefined) {
                updateTerm(term);
            }
        }
    }, [availableTerms, updateTerm, selectedTerm]);

    const handleAmountValueChange = useCallback(
        (value: number) => {
            getDebouncedDynamicOffer.cancel();
            setIsLoading(true);
            onSelectedAmountChange(value);
        },
        [getDebouncedDynamicOffer, onSelectedAmountChange]
    );

    const emmitAmountValueChangeEvent = useCallback(
        (val: number) => {
            const relativeToDefault = getRelativeToDefault(val, defaultAmountValue);
            const valuePercentage = getPercentageOfRange(val, dynamicOffersConfig?.minAmount.value, dynamicOffersConfig?.maxAmount.value);

            userEvents.addEvent?.('Changed capital offer slider', {
                ...sharedAnalyticsEventProperties,
                label: 'Slider changed',
                currency: currency!,
                value: val,
                valuePercentage,
                min: dynamicOffersConfig?.minAmount.value,
                max: dynamicOffersConfig?.maxAmount.value,
                relativeToDefault,
                isEarlyRenewal,
            });
        },
        [dynamicOffersConfig, defaultAmountValue, userEvents, currency, isEarlyRenewal]
    );

    const handleSliderRelease = useCallback(
        (val: number) => {
            try {
                return getDebouncedDynamicOffer(val);
            } finally {
                emmitAmountValueChangeEvent(val);
            }
        },
        [getDebouncedDynamicOffer, emmitAmountValueChangeEvent]
    );

    useEffect(() => {
        if (dynamicOffersConfig && !getDynamicGrantOfferMutation.data && !hasInitializedRef.current) {
            hasInitializedRef.current = true;
            const initialValue = selectedAmount ?? getDefaultAmountValue(dynamicOffersConfig);
            if (selectedAmount === undefined) {
                onSelectedAmountChange(initialValue);
            }
            void getDynamicOffer(initialValue);
            emmitAmountValueChangeEvent(initialValue);
        }
    }, [
        dynamicOffersConfig,
        getDynamicGrantOfferMutation.data,
        getDynamicOffer,
        defaultAmountValue,
        selectedAmount,
        onSelectedAmountChange,
        emmitAmountValueChangeEvent,
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

    const hasSingleTerm = useMemo(() => allTerms.length === 1, [allTerms]);

    const renderHighlightedFields = () => {
        const renewableGrant = capitalState?.renewableGrants[0];
        if (!renewableGrant) return null;
        return isLoadingIndicatorVisible ? (
            <HighlightedFieldsLoadingSkeleton />
        ) : (
            <RenewalHighlightedFields remainingGrantAmount={renewableGrant.remainingGrantAmount} newGrantAmount={matchedOffer!.grantAmount} />
        );
    };

    return (
        <div className="adyen-pe-capital-offer-selection">
            {reviewOfferMutation.error || getDynamicGrantOfferMutation.error || capitalStateError || termsError ? (
                <CapitalErrorMessageDisplay
                    error={reviewOfferMutation.error || getDynamicGrantOfferMutation.error || capitalStateError}
                    onBack={onOfferDismiss}
                    onContactSupport={onContactSupport}
                />
            ) : (
                <>
                    {dynamicOffersConfig && (
                        <>
                            <CapitalSlider
                                value={selectedAmount}
                                dynamicOffersConfig={dynamicOffersConfig}
                                onValueChange={handleAmountValueChange}
                                onRelease={handleSliderRelease}
                            />
                            {renderHighlightedFields()}
                        </>
                    )}
                    {allTerms.length > 1 && (
                        <TermSelector
                            allTerms={allTerms}
                            availableTerms={availableTerms}
                            selectedTerm={selectedTerm}
                            termOfferMap={offersByTerm}
                            isLoadingIndicatorVisible={isLoadingIndicatorVisible}
                            onTermSelect={updateTerm}
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
                            onClick={reviewOffer}
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

import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import StructuredList from '../../../../internal/StructuredList';
import Button from '../../../../internal/Button/Button';
import { ButtonVariant } from '../../../../internal/Button/types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useEventDispatcherContext from '../../../../../core/Context/eventDispatcher/useEventDispatcherContext';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { useConfigContext } from '../../../../../core/ConfigContext';
import useMutation from '../../../../../hooks/useMutation/useMutation';
import { IDynamicOffersConfig, IGrantOfferResponseDTO } from '../../../../../types';
import './CapitalOfferSelection.scss';
import { sharedCapitalOfferAnalyticsEventProperties } from '../CapitalOffer/constants';
import { getMaximumRepaymentDate, getPercentage, getTermMonthsAndRemainingDays } from '../utils/utils';
import CapitalSlider from '../../../../internal/CapitalSlider';
import { CapitalErrorMessageDisplay } from '../utils/CapitalErrorMessageDisplay';
import { calculateSliderAdjustedMidValue } from '../../../../internal/Slider/Slider';
import { debounce } from '../../../../utils/utils';
import { DATE_FORMAT_CAPITAL_OVERVIEW, EMPTY_OBJECT } from '@integration-components/utils';
import Card from '../../../../internal/Card/Card';
import useTimezoneAwareDateFormatting from '../../../../../hooks/useTimezoneAwareDateFormatting';

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
                                  value: i18n.get('capital.common.values.numberOfDays', { values: { days: data.expectedRepaymentPeriodDays } }),
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
    const userEvents = useEventDispatcherContext();

    const allTerms = useMemo(() => dynamicOffersConfig?.estimatedRepaymentTermsInDays ?? [], [dynamicOffersConfig]);
    const [selectedTerm, setSelectedTerm] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (allTerms.length > 0 && selectedTerm === undefined) {
            const selectedIndex = Math.min(1, allTerms.length - 1);
            setSelectedTerm(allTerms[selectedIndex]);
        }
    }, [allTerms, selectedTerm]);

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

    const termOfferMap = useMemo<Record<number, IGrantOfferResponseDTO>>(() => {
        const offers = getDynamicGrantOfferMutation.data?.offers ?? [];
        return Object.fromEntries(offers.map(offer => [offer.expectedRepaymentPeriodDays, offer]));
    }, [getDynamicGrantOfferMutation.data]);

    const availableTerms = useMemo<number[]>(() => Object.keys(termOfferMap).map(Number), [termOfferMap]);

    useEffect(() => {
        if (availableTerms.length > 0 && selectedTerm !== undefined && !availableTerms.includes(selectedTerm)) {
            const nearest = availableTerms.reduce((prev, curr) => (Math.abs(curr - selectedTerm) < Math.abs(prev - selectedTerm) ? curr : prev));
            setSelectedTerm(nearest);
        }
    }, [availableTerms, selectedTerm]);

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
            if (selectedTerm) {
                void reviewOfferMutation.mutate(
                    {
                        body: {
                            amount: matchedOffer?.grantAmount.value || requestedValue!,
                            currency: matchedOffer?.grantAmount.currency || currency!,
                            selectedEstimatedRepaymentTermDaysInDays: selectedTerm,
                        },
                        contentType: 'application/json',
                    },
                    { query: EMPTY_OBJECT }
                );
            }
        } finally {
            userEvents.addEvent?.('Clicked button', { ...sharedAnalyticsEventProperties, label: 'Review offer' });
        }
    }, [currency, matchedOffer, requestedValue, reviewOfferMutation, selectedTerm, userEvents]);

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
                    currency: currency!,
                    value: val,
                });
            }
        },
        [debouncedGetOfferCall, userEvents, currency]
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

    const selectTerm = useCallback(
        (term: number) => {
            setSelectedTerm(term);
            userEvents.addEvent?.('Selected repayment term', {
                ...sharedAnalyticsEventProperties,
                label: 'Term selected',
                value: term,
            });
        },
        [userEvents]
    );

    const formatTermLabel = useCallback(
        (days: number): string => {
            const { months, remainingDays } = getTermMonthsAndRemainingDays(days);
            const monthsPart =
                months === 1 ? i18n.get('capital.common.values.oneMonth') : i18n.get('capital.common.values.numberOfMonths', { values: { months } });

            const remainingDaysPart =
                remainingDays === 0
                    ? undefined
                    : remainingDays === 1
                      ? i18n.get('capital.common.values.oneDay')
                      : i18n.get('capital.common.values.numberOfDays', { values: { days: remainingDays } });

            return [monthsPart, remainingDaysPart].filter(Boolean).join(', ');
        },
        [i18n]
    );

    const hasConfiguredTerms = allTerms.length > 0;

    const isLoadingIndicatorVisible = useMemo(
        () => !matchedOffer || getDynamicGrantOfferMutation.isLoading || isLoading,
        [getDynamicGrantOfferMutation.isLoading, isLoading, matchedOffer]
    );

    const hasSingleTerm = useMemo(() => allTerms.length === 1, [allTerms.length]);

    return (
        <div className="adyen-pe-capital-offer-selection">
            {reviewOfferMutation.error || getDynamicGrantOfferMutation.error || emptyGrantOffer || dynamicOffersConfigError || !hasConfiguredTerms ? (
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
                    {allTerms.length > 1 && (
                        <div className="adyen-pe-capital-offer-selection__terms-container">
                            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                                {i18n.get('capital.offer.selection.termOptions.title')}
                            </Typography>
                            <div
                                className="adyen-pe-capital-offer-selection__terms"
                                role="radiogroup"
                                aria-label={i18n.get('capital.offer.selection.termOptions.title')}
                            >
                                {allTerms.map(term => {
                                    const isDisabled = !availableTerms.includes(term);
                                    const isSelected = term === selectedTerm;
                                    const termOffer = termOfferMap[term];

                                    return (
                                        <Card
                                            key={term}
                                            noOutline
                                            noPadding
                                            onClick={!isDisabled ? () => selectTerm(term) : undefined}
                                            classNameModifiers={[
                                                'adyen-pe-capital-offer-selection__term',
                                                ...(isSelected ? ['adyen-pe-capital-offer-selection__term--selected'] : []),
                                                ...(isDisabled ? ['adyen-pe-capital-offer-selection__term--disabled'] : []),
                                            ]}
                                        >
                                            <div className="adyen-pe-capital-offer-selection__term-content">
                                                <Typography
                                                    el={TypographyElement.SPAN}
                                                    variant={TypographyVariant.BODY}
                                                    stronger={isSelected}
                                                    className={isDisabled ? 'adyen-pe-capital-offer-selection__term-content--disabled' : undefined}
                                                >
                                                    {formatTermLabel(term)}
                                                </Typography>
                                                {isLoadingIndicatorVisible ? (
                                                    <div className="adyen-pe-capital-offer-selection__loading-skeleton"></div>
                                                ) : (
                                                    !isDisabled &&
                                                    termOffer && (
                                                        <Typography el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION}>
                                                            {i18n.get('capital.offer.selection.termOptions.dailyRatePercentage', {
                                                                values: { percentage: getPercentage(termOffer.repaymentRate) },
                                                            })}
                                                        </Typography>
                                                    )
                                                )}
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
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

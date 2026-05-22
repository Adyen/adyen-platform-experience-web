import { useCallback } from 'preact/hooks';
import Typography from '../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../internal/Typography/types';
import Card from '../../../internal/Card/Card';
import useCoreContext from '../../../../core/Context/useCoreContext';
import useEventDispatcherContext from '../../../../core/Context/eventDispatcher/useEventDispatcherContext';
import { IGrantOfferResponseDTO } from '../../../../types';
import { sharedCapitalOfferAnalyticsEventProperties } from './CapitalOffer/constants';
import { getPercentage } from './utils/utils';
import { useFormatTermLabel } from './hooks/useFormatTermLabel';

const sharedAnalyticsEventProperties = {
    ...sharedCapitalOfferAnalyticsEventProperties,
    subCategory: 'Business financing offer',
} as const;

type TermSelectorProps = {
    allTerms: number[];
    availableTerms: number[];
    selectedTerm: number | undefined;
    termOfferMap: Record<number, IGrantOfferResponseDTO>;
    isLoadingIndicatorVisible: boolean;
    onTermSelect: (term: number) => void;
};

export const TermSelector = ({
    allTerms,
    availableTerms,
    selectedTerm,
    termOfferMap,
    isLoadingIndicatorVisible,
    onTermSelect,
}: TermSelectorProps) => {
    const { i18n } = useCoreContext();
    const userEvents = useEventDispatcherContext();
    const formatTermLabel = useFormatTermLabel();

    const selectTerm = useCallback(
        (term: number) => {
            onTermSelect(term);
            userEvents.addEvent?.('Selected repayment term', {
                ...sharedAnalyticsEventProperties,
                label: 'Term selected',
                value: term,
            });
        },
        [onTermSelect, userEvents]
    );

    return (
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
                            role="radio"
                            ariaChecked={isSelected}
                            ariaDisabled={isDisabled}
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
    );
};

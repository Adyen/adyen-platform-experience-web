import Typography from '@integration-components/ui-components-preact/Typography/Typography';
import { TypographyElement, TypographyVariant } from '@integration-components/ui-components-preact/Typography/types';
import Card from '@integration-components/ui-components-preact/Card/Card';
import { useCoreContext } from '@integration-components/core/preact';
import { IGrantOfferResponseDTO } from '@integration-components/types';
import { calculatePercentageFromBasisPoints } from '@integration-components/capital/domain';
import { useFormatTermLabel } from './hooks/useFormatTermLabel';

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
    const formatTermLabel = useFormatTermLabel();

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
                            onClick={!isDisabled ? () => onTermSelect(term) : undefined}
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
                                                values: { percentage: calculatePercentageFromBasisPoints(termOffer.repaymentRate) },
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

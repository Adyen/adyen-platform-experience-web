export interface CapitalOverviewProps {
    skipPreQualifiedIntro?: boolean;
    onOfferReview?(): void;
}

export type CapitalComponentStatus = 'NotQualified' | 'OfferAvailable' | 'OfferAccepted';

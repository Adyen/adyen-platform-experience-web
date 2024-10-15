import { IGrant } from '../../../types';

export interface CapitalOverviewProps {
    skipPreQualifiedIntro?: boolean;
    onSeeOptions?(goToNextStep: () => void): void;
    onRequestFunds?: (data: IGrant, goToNextStep: () => void) => void;
    onOfferDismissed?: (goToPreviousStep: () => void) => void;
}

export type CapitalComponentStatus = 'NotQualified' | 'OfferAvailable' | 'OfferAccepted';

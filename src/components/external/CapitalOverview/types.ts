import { IGrant } from '../../../types';

export interface CapitalOverviewProps {
    skipPreQualifiedIntro?: boolean;
    onFundsRequest?: (data: IGrant, goToNextStep: () => void) => void;
    onOfferDismissed?: (goToPreviousStep: () => void) => void;
    onOfferOptionsRequest?(goToNextStep: () => void): void;
}

export type CapitalComponentState = 'Unqualified' | 'PreQualified' | 'GrantList';

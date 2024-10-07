import { IGrant } from '../../../types';

export interface CapitalOverviewProps {
    skipPreQualifiedIntro?: boolean;
    onReviewOptions?(goToNextStep: () => void): void;
    onOfferSigned?: (data: IGrant, goToNextStep: () => void) => void;
}

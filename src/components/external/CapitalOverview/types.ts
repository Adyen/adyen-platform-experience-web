import { IGrant } from '../../../types';

export interface CapitalOverviewProps {
    skipPreQualifiedIntro?: boolean;
    onReviewOptions?(goToNextStep: () => void): void;
    onRequestFunds?: (data: IGrant, goToNextStep: () => void) => void;
}

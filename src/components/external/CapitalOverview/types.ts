import { IGrant } from '../../../types';

export interface CapitalOverviewProps {
    onFundsRequest?: (data: IGrant) => void;
    onOfferDismiss?: () => void;
    onOfferOptionsRequest?: () => void;
    skipPreQualifiedIntro?: boolean;
}

export type CapitalComponentState = { state: 'Unqualified' | 'PreQualified' | 'GrantList' };

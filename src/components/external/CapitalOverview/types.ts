import { IGrant } from '../../../types';
import { UIElementProps } from '../../types';

export interface CapitalOverviewProps extends UIElementProps {
    onFundsRequest?: (data: IGrant) => void;
    onOfferDismiss?: () => void;
    onOfferOptionsRequest?: () => void;
    skipPreQualifiedIntro?: boolean;
}

export type CapitalComponentState = {
    state: 'isUnqualified' | 'isPreQualified' | 'hasRequestedGrants' | 'isInUnsupportedRegion';
};

export type CapitalOverviewComponentProps = CapitalOverviewProps;

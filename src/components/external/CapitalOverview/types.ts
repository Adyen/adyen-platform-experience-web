import { IGrant } from '../../../types';
import { UIElementProps } from '../../types';

/**
 * Props for the CapitalOverview component
 */
export interface CapitalOverviewProps extends UIElementProps {
    /** Callback fired when user requests funds */
    onFundsRequest?: (data: IGrant) => void;
    /** Callback fired when user dismisses an offer */
    onOfferDismiss?: () => void;
    /** Callback fired when user requests offer options */
    onOfferOptionsRequest?: () => void;
    /** Whether to skip the pre-qualified intro screen */
    skipPreQualifiedIntro?: boolean;
}

/**
 * Internal state representation for CapitalOverview
 */
export type CapitalComponentState = {
    state: 'isUnqualified' | 'isPreQualified' | 'hasRequestedGrants' | 'isInUnsupportedRegion';
};

/**
 * Public component props exported from the Element
 */
export type CapitalOverviewComponentProps = CapitalOverviewProps;

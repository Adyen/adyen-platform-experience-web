import { IGrant, IMissingActionType } from '../../../types';
import { TranslationKey } from '../../../translations';

export interface CapitalOverviewProps {
    onFundsRequest?: (data: IGrant) => void;
    onOfferDismiss?: () => void;
    onOfferOptionsRequest?: () => void;
    skipPreQualifiedIntro?: boolean;
}

export type CapitalComponentState = { state: 'isUnqualified' | 'isPreQualified' | 'hasRequestedGrants' | 'isInUnsupportedRegion' };

type ActionConfig = {
    buttonLabelKey: TranslationKey;
    eventLabel: string;
    successButtonLabelKey: TranslationKey;
};

export type ActionConfigs = {
    [key in IMissingActionType]: ActionConfig;
};

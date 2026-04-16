import { IGrant, IMissingActionType } from '../../../types';
import { TranslationKey } from '../../../translations';
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

type ActionConfig = {
    buttonLabelKey: TranslationKey;
    eventLabel: string;
    successButtonLabelKey: TranslationKey;
};

export type ActionConfigs = {
    [key in IMissingActionType]: ActionConfig;
};

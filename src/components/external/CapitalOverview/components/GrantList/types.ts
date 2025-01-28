import { IDynamicOffersConfig, IGrant } from '../../../../../types';
import { ValueOfRecord } from '../../../../../utils/types';
import { GrantDetailsView } from './constants';

export type GrantDetailsViewType = ValueOfRecord<typeof GrantDetailsView>;
export type GrantDetailsViewCallback = (grant: IGrant, detailsView?: GrantDetailsViewType) => void;

export interface GrantDetailsViewProps {
    detailsView: GrantDetailsViewType;
    grant: IGrant;
    onDisplayClose: () => void;
}

export interface GrantListProps {
    externalDynamicOffersConfig?: IDynamicOffersConfig;
    grantList: IGrant[];
    hideTitle?: boolean;
    newOfferAvailable: boolean;
    onFundsRequest: (data: IGrant) => void;
    onOfferDismiss?: (goToPreviousStep: () => void) => void;
}

export interface GrantsProps {
    grantList: IGrant[];
    hideTitle?: boolean;
    newOfferAvailable: boolean;
    onNewOfferRequest: () => void;
}

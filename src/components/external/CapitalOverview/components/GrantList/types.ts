import { IGrant } from '../../../../../types';

export interface GrantListProps {
    grantList: IGrant[];
    hideTitle?: boolean;
    newOfferAvailable: boolean;
}

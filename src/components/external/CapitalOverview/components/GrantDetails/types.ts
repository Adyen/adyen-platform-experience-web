import { IGrant } from '../../../../../types';
import { ValueOfRecord } from '../../../../../utils/types';
import { GRANT_DETAILS_VIEWS } from './constants';

export type GrantDetailsView = ValueOfRecord<typeof GRANT_DETAILS_VIEWS>;
export type GrantDetailsViewCallback = (grant: IGrant, detailsView?: GrantDetailsView) => void;

export interface GrantDetailsViewProps {
    grant: IGrant;
    onDetailsClose: () => void;
}

export interface GrantDetailsProps {
    grant: IGrant;
}

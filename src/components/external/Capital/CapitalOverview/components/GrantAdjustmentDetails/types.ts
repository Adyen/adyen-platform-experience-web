import { IGrant } from '../../../../../../types';
import { ValueOfRecord } from '../../../../../../utils/types';
import { GRANT_ADJUSTMENT_DETAILS } from './constants';

export type GrantAdjustmentDetail = ValueOfRecord<typeof GRANT_ADJUSTMENT_DETAILS>;
export type GrantAdjustmentDetailCallback = (grant: IGrant, detail?: GrantAdjustmentDetail) => void;

export interface GrantAdjustmentDetailsProps {
    grant: IGrant;
    onDetailsClose: () => void;
}

import { IGrant } from '@integration-components/types';
import { ValueOfRecord } from '@integration-components/utils/types';
import { GRANT_ADJUSTMENT_DETAILS } from '../../../../../domain/src/CapitalOverview/constants';

export type GrantAdjustmentDetail = ValueOfRecord<typeof GRANT_ADJUSTMENT_DETAILS>;
export type GrantAdjustmentDetailCallback = (grant: IGrant, detail?: GrantAdjustmentDetail) => void;

export interface GrantAdjustmentDetailsProps {
    grant: IGrant;
    onDetailsClose: () => void;
}

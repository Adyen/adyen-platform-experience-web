import { IGrant } from '../../../../../types';
import { GrantAdjustmentDetailCallback } from '../GrantAdjustmentDetails/types';
import { ListWithoutFirst } from '../../../../../utils/types';

export interface GrantItemProps {
    grant: IGrant;
    showDetails?: (...args: ListWithoutFirst<Parameters<GrantAdjustmentDetailCallback>>) => ReturnType<GrantAdjustmentDetailCallback>;
}

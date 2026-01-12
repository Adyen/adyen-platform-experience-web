import { IGrant } from '../../../../../../types';
import { GrantAdjustmentDetailCallback } from '../GrantAdjustmentDetails/types';
import { ListWithoutFirst } from '../../../../../../utils/types';
import { TagVariant } from '../../../../../internal/Tag/types';
import { TranslationKey } from '../../../../../../translations';

export interface GrantItemProps {
    grant: IGrant;
    showDetails?: (...args: ListWithoutFirst<Parameters<GrantAdjustmentDetailCallback>>) => ReturnType<GrantAdjustmentDetailCallback>;
}

export interface GrantConfig {
    amount: IGrant['grantAmount'];
    amountLabelKey: TranslationKey;
    hasAlerts: boolean;
    hasDetails: boolean;
    hasUnscheduledRepaymentDetails: boolean;
    isAmountColorSecondary: boolean;
    isBackgroundFilled: boolean;
    isGrantIdVisible: boolean;
    isLabelColorSecondary: boolean;
    isProgressBarVisible: boolean;
    repaymentPeriodEndDate: Date;
    statusKey?: TranslationKey;
    statusTagVariant: TagVariant;
    statusTooltipKey?: TranslationKey;
}

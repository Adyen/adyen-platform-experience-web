import { IGrant } from '@integration-components/types';
import { ListWithoutFirst } from '@integration-components/utils/types';
import { TranslationKey } from '@integration-components/core';
import { GrantAdjustmentDetailCallback } from '../GrantAdjustmentDetails/types';
import { TagVariant } from '@integration-components/ui-components-preact/Tag/types';

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

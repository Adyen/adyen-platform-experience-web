import type { IAmount } from '@integration-components/types';
import type { RenewalAmountBreakdown } from './generic';

export const getRenewalAmountBreakdown = (newGrantAmount: IAmount, remainingGrantAmount: IAmount): RenewalAmountBreakdown => {
    return {
        amountToReceive: newGrantAmount.value - remainingGrantAmount.value,
        currency: newGrantAmount.currency,
        newGrantAmountValue: newGrantAmount.value,
        remainingGrantAmountValue: remainingGrantAmount.value,
    };
};

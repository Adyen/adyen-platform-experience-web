import type { IAmount } from '@integration-components/types';
import type { RenewalAmountBreakdown } from './generic';

export const getRenewalAmountBreakdown = (newGrantAmountValue: number, remainingGrantAmount: IAmount): RenewalAmountBreakdown => {
    return {
        amountToReceive: newGrantAmountValue - remainingGrantAmount.value,
        currency: remainingGrantAmount.currency,
        newGrantAmountValue: newGrantAmountValue,
        remainingGrantAmountValue: remainingGrantAmount.value,
    };
};

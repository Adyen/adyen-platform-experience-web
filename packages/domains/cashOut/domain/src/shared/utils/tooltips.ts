import type { ICashOutAmount, ICashOutEligibility } from '@integration-components/types';

type CashOutFeeStructure = ICashOutEligibility['feeStructure'];

export type CashOutAvailableForCashOutTooltip =
    | { key: 'cashOut.common.availableForCashOut.tooltips.withDailyLimit'; dailyLimit: ICashOutAmount }
    | { key: 'cashOut.common.availableForCashOut.tooltips.default' };

export type CashOutFeeTooltip =
    | { key: 'cashOut.request.fields.fees.tooltips.fixedAndVariable'; fixedAmount: ICashOutAmount; basisPoints: number }
    | { key: 'cashOut.request.fields.fees.tooltips.variable'; basisPoints: number }
    | { key: 'cashOut.request.fields.fees.tooltips.fixed'; fixedAmount: ICashOutAmount }
    | { key: 'cashOut.request.fields.fees.tooltips.free' };

/** How much can be cashed out, with the daily limit when the balance account has one: `null` (as on test) means no limit, while 0 is a limit of 0. */
export const getAvailableForCashOutTooltip = (dailyLimit: ICashOutAmount | null | undefined): CashOutAvailableForCashOutTooltip =>
    dailyLimit
        ? { key: 'cashOut.common.availableForCashOut.tooltips.withDailyLimit', dailyLimit }
        : { key: 'cashOut.common.availableForCashOut.tooltips.default' };

/** How the fee of a cashOut is calculated, from the fee structure of the balance account. */
export const getFeeTooltip = ({ fixedAmount, variableBasisPoints }: CashOutFeeStructure): CashOutFeeTooltip => {
    const hasFixedAmount = fixedAmount.value > 0;
    const hasVariablePart = variableBasisPoints > 0;
    if (hasFixedAmount && hasVariablePart) {
        return { key: 'cashOut.request.fields.fees.tooltips.fixedAndVariable', fixedAmount, basisPoints: variableBasisPoints };
    }
    if (hasVariablePart) return { key: 'cashOut.request.fields.fees.tooltips.variable', basisPoints: variableBasisPoints };
    if (hasFixedAmount) return { key: 'cashOut.request.fields.fees.tooltips.fixed', fixedAmount };
    return { key: 'cashOut.request.fields.fees.tooltips.free' };
};

/** Basis points as a percentage in the given locale: 150 is 1.5%. */
export const formatBasisPoints = (basisPoints: number, locale: string) =>
    new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 2 }).format(basisPoints / 10_000);

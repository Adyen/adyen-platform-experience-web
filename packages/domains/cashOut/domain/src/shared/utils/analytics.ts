import type { AdyenPlatformExperienceError } from '@integration-components/core';
import type { ICashOutAmount, ICashOutEligibility } from '@integration-components/types';

/** How many balance accounts or bank accounts there are, coarsely, as which they are is not sent. */
export type CashOutCountBucket = '0' | '1' | '2-9' | '10+';

/** How much of what is available is cashed out, coarsely, as amounts are not sent. */
export type CashOutAmountShare = '<25%' | '25-50%' | '50-75%' | '75-100%';

export const getCountBucket = (count: number): CashOutCountBucket => {
    if (count <= 0) return '0';
    if (count === 1) return '1';
    return count < 10 ? '2-9' : '10+';
};

export const getAmountShare = (amount: ICashOutAmount, available: ICashOutAmount): CashOutAmountShare | undefined => {
    // An amount above what is available can't be cashed out, so it has no share of it
    if (available.value <= 0 || amount.currency !== available.currency || amount.value > available.value) return undefined;
    const share = amount.value / available.value;
    if (share < 0.25) return '<25%';
    if (share < 0.5) return '25-50%';
    return share < 0.75 ? '50-75%' : '75-100%';
};

export const isWholeAmount = (amount: ICashOutAmount, available: ICashOutAmount) =>
    amount.currency === available.currency && amount.value === available.value;

/** How much of what is available an amount is, without the amount itself; nothing of it without an amount. */
export const getAmountAnalyticsProperties = (amount: ICashOutAmount | undefined, available: ICashOutAmount) => ({
    isWholeAmount: !!amount && isWholeAmount(amount, available),
    amountShare: amount && getAmountShare(amount, available),
});

/** What went wrong, as precisely as the error tells it: its error code, otherwise its HTTP status, otherwise its type. */
export const getErrorReturnValue = (error: AdyenPlatformExperienceError | undefined): string =>
    error?.errorCode ?? error?.status ?? error?.type ?? 'unknown';

/** Whether the balance account can cash out, otherwise the reason it can't first, and in which currency. */
export const getEligibilityAnalyticsProperties = ({ availableForCashOutBalance, isCashoutAvailable, unavailableReasons }: ICashOutEligibility) => ({
    isAvailable: isCashoutAvailable,
    unavailableReason: unavailableReasons[0],
    currency: availableForCashOutBalance.currency,
});

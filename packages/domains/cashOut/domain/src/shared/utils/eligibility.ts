import type { TranslationKey } from '@integration-components/core';
import type { ICashOutAmount, ICashOutEligibility, ICashOutUnavailableReason } from '@integration-components/types';

const NOT_ALLOWED = 'cashOut.common.unavailableReasons.notAllowed';

// A zero balance already shows as an amount of 0, so it gets no message.
const UNAVAILABLE_REASON_MESSAGES = {
    zeroBalance: undefined,
    noInstantReachableTransferInstruments: 'cashOut.common.unavailableReasons.noInstantReachableTransferInstruments',
    cashOutInProgress: 'cashOut.common.unavailableReasons.cashOutInProgress',
    dailyLimitReached: 'cashOut.common.unavailableReasons.dailyLimitReached',
    sendToBalanceAccountNotAllowed: NOT_ALLOWED,
    receiveFromBalanceAccountNotAllowed: NOT_ALLOWED,
    sendToTransferInstrumentNotAllowed: NOT_ALLOWED,
    riskRestricted: 'cashOut.common.unavailableReasons.riskRestricted',
    cashOutNotConfigured: NOT_ALLOWED,
} as const satisfies Record<ICashOutUnavailableReason, TranslationKey | undefined>;

type UnavailableReasonMessageKey = NonNullable<(typeof UNAVAILABLE_REASON_MESSAGES)[ICashOutUnavailableReason]>;

// Messages that ask the user to contact support, so the contact support action is offered with them.
const SUPPORT_REASON_MESSAGES = new Set<UnavailableReasonMessageKey>([NOT_ALLOWED]);

// A cashOut in progress and the daily limit pass with time, so they inform; the others need the user or support to act, so they warn.
const INFORMING_REASON_MESSAGES = new Set<UnavailableReasonMessageKey>([
    'cashOut.common.unavailableReasons.cashOutInProgress',
    'cashOut.common.unavailableReasons.dailyLimitReached',
]);

export type CashOutUnavailableReasonMessage = {
    key: UnavailableReasonMessageKey;
    offersContactSupport: boolean;
    /** The alert type the message is shown in. */
    type: 'highlight' | 'warning';
};

/** Why the balance account can't cash out, or `undefined` when there is nothing to explain. */
export const getUnavailableReasonMessage = (eligibility: ICashOutEligibility): CashOutUnavailableReasonMessage | undefined => {
    if (eligibility.isCashoutAvailable) return undefined;
    const [reason] = eligibility.unavailableReasons;
    if (reason === 'zeroBalance') return undefined;
    // The general message covers a missing reason, and one added to the API that the component doesn't know yet.
    const key = (reason && UNAVAILABLE_REASON_MESSAGES[reason]) || NOT_ALLOWED;
    return { key, offersContactSupport: SUPPORT_REASON_MESSAGES.has(key), type: INFORMING_REASON_MESSAGES.has(key) ? 'highlight' : 'warning' };
};

// The API reports a cashOut without an account to receive it as unavailable; should it not, the components still don't offer it.
export const withoutUnreachableCashOut = (eligibility: ICashOutEligibility | undefined): ICashOutEligibility | undefined => {
    if (!eligibility?.isCashoutAvailable || eligibility.transferInstruments.some(({ eligible }) => eligible)) return eligibility;
    return { ...eligibility, isCashoutAvailable: false, unavailableReasons: ['noInstantReachableTransferInstruments'] };
};

/** What is left to cash out after cashing out `cashedOut`, the fee being taken out of it; at least 0. */
export const getAvailableAfterCashOut = (available: ICashOutAmount, cashedOut: ICashOutAmount): ICashOutAmount =>
    cashedOut.currency === available.currency ? { ...available, value: Math.max(0, available.value - cashedOut.value) } : available;

/** What is available to cash out: the lower of what the API shows and what is expected after cashOuts it may not show yet. */
export const withExpectedAmount = (amount: ICashOutAmount | undefined, expected: ICashOutAmount | undefined): ICashOutAmount | undefined =>
    amount && expected && expected.currency === amount.currency && expected.value < amount.value ? expected : amount;

/** Whether the API shows no more than what is expected after a cashOut: it then has the cashOut, so what it shows counts again. */
export const hasCaughtUpWithExpectedAmount = (amount: ICashOutAmount | undefined, expected: ICashOutAmount | undefined): boolean =>
    !!amount && !!expected && amount.currency === expected.currency && amount.value <= expected.value;

// Right after a cashOut the API still processes it and shows what was available before it, so what is expected is shown instead,
// until the API shows no more than that. Its unavailable reasons stay, such as the cashOut in progress.
export const withExpectedAvailableForCashOut = (
    eligibility: ICashOutEligibility | undefined,
    expected: ICashOutAmount | undefined
): ICashOutEligibility | undefined => {
    const availableForCashOutBalance = withExpectedAmount(eligibility?.availableForCashOutBalance, expected);
    if (!eligibility || !availableForCashOutBalance || availableForCashOutBalance === eligibility.availableForCashOutBalance) return eligibility;
    if (availableForCashOutBalance.value > 0 || !eligibility.isCashoutAvailable) return { ...eligibility, availableForCashOutBalance };
    return { ...eligibility, availableForCashOutBalance, isCashoutAvailable: false, unavailableReasons: ['zeroBalance'] };
};

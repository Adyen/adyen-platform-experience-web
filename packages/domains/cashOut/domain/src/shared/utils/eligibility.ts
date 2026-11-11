import type { TranslationKey } from '@integration-components/core';
import type { ICashOutEligibility, ICashOutUnavailableReason } from '@integration-components/types';

const NOT_ALLOWED = 'cashOut.common.unavailableReasons.notAllowed';

// A zero balance already shows as an amount of 0, so it gets no message.
const UNAVAILABLE_REASON_MESSAGES = {
    zeroBalance: undefined,
    noInstantReachableTransferInstruments: 'cashOut.common.unavailableReasons.noInstantReachableTransferInstruments',
    cashOutInProgress: 'cashOut.common.unavailableReasons.cashOutInProgress',
    dailyLimitReached: 'cashOut.common.unavailableReasons.dailyLimitReached',
    sendToBalanceAccountNotAllowed: NOT_ALLOWED,
    receiveFromBalanceAccountNotAllowed: NOT_ALLOWED,
    riskRestricted: 'cashOut.common.unavailableReasons.riskRestricted',
    cashOutNotConfigured: NOT_ALLOWED,
} as const satisfies Record<ICashOutUnavailableReason, TranslationKey | undefined>;

type UnavailableReasonMessageKey = NonNullable<(typeof UNAVAILABLE_REASON_MESSAGES)[ICashOutUnavailableReason]>;

// Messages that ask the user to contact support, so the contact support action is offered with them.
const SUPPORT_REASON_MESSAGES = new Set<UnavailableReasonMessageKey>([NOT_ALLOWED]);

export type CashOutUnavailableReasonMessage = {
    key: UnavailableReasonMessageKey;
    offersContactSupport: boolean;
};

/** Why the balance account can't cash out, or `undefined` when there is nothing to explain. */
export const getUnavailableReasonMessage = (eligibility: ICashOutEligibility): CashOutUnavailableReasonMessage | undefined => {
    if (eligibility.isCashoutAvailable) return undefined;
    const [reason] = eligibility.unavailableReasons;
    if (reason === 'zeroBalance') return undefined;
    // The general message covers a missing reason, and one added to the API that the component doesn't know yet.
    const key = (reason && UNAVAILABLE_REASON_MESSAGES[reason]) || NOT_ALLOWED;
    return { key, offersContactSupport: SUPPORT_REASON_MESSAGES.has(key) };
};

// The API reports a cashOut without an account to receive it as unavailable; should it not, the components still don't offer it.
export const withoutUnreachableCashOut = (eligibility: ICashOutEligibility | undefined): ICashOutEligibility | undefined => {
    if (!eligibility?.isCashoutAvailable || eligibility.transferInstruments.some(({ eligible }) => eligible)) return eligibility;
    return { ...eligibility, isCashoutAvailable: false, unavailableReasons: ['noInstantReachableTransferInstruments'] };
};

import type { TranslationKey } from '@integration-components/core';
import type { ICashOutTransferInstrument, ICashOutTransferInstrumentIneligibilityReason } from '@integration-components/types';

const INELIGIBILITY_REASON_MESSAGES = {
    noInstantTransferRoute: 'cashOut.request.fields.transferInstrument.ineligibilityReasons.noInstantTransferRoute',
    // Without the capability the account holder can't cash out at all, so the component never lists accounts for this reason.
    sendToTransferInstrumentNotAllowed: undefined,
    transferInstrumentCurrencyMismatch: 'cashOut.request.fields.transferInstrument.ineligibilityReasons.transferInstrumentCurrencyMismatch',
} as const satisfies Record<ICashOutTransferInstrumentIneligibilityReason, TranslationKey | undefined>;

export type CashOutTransferInstrumentOption = {
    transferInstrumentId: string;
    description: string;
    eligible: boolean;
    /** Why the account can't receive the cashOut, as a translation key and its values. */
    ineligibilityReason?: { key: TranslationKey; values?: Record<string, string> };
};

/**
 * The accounts to choose from to receive the cashOut. Ineligible accounts stay listed, with the reason they can't receive it.
 * Eligible accounts come first; the sort is stable, so each group keeps the order of the API.
 */
export const getTransferInstrumentOptions = (
    transferInstruments: ICashOutTransferInstrument[],
    currency: string
): CashOutTransferInstrumentOption[] =>
    [...transferInstruments]
        .sort((a, b) => Number(b.eligible) - Number(a.eligible))
        .map(({ description, eligible, ineligibilityReasons: [reason], transferInstrumentId }) => {
            const key = eligible || !reason ? undefined : INELIGIBILITY_REASON_MESSAGES[reason];
            const values = reason === 'transferInstrumentCurrencyMismatch' ? { currency } : undefined;
            return { transferInstrumentId, description, eligible, ineligibilityReason: key ? { key, values } : undefined };
        });

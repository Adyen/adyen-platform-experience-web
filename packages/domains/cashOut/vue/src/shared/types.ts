import type { ICashOutResponse } from '@integration-components/types';

/**
 * What the integration can set on the cashOut, in the CashOut Overview and the CashOut Request alike. The balance accounts come from
 * the session instead: an account holder session offers all of its balance accounts, a balance account session only that one.
 */
export type CashOutIntegrationProps = {
    /** Called with the cashOut once it is instructed, so the integration can track it by its id. */
    onCashOutInstructed?: (cashOut: ICashOutResponse) => void;
    /**
     * The reference sent to the recipient of the cashOut, and in every webhook about it. Supported characters: a-z, A-Z, 0-9.
     * Without it, Adyen generates one.
     */
    referenceForBeneficiary?: string;
    /**
     * The description of the transfer, which most banks show to the recipient. Longer than 140 characters may be truncated.
     * Supported characters: a-z A-Z 0-9 / - ? : ( ) . , ' + and space. Without it, Adyen generates one.
     */
    transferDescription?: string;
};

/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/v1/payouts/{payoutId}": {
    /**
     * Get payout details
     * @description Given a payout ID, it retrieves its details
     */
    get: operations["getPayout"];
  };
  "/v1/payouts": {
    /**
     * Get payouts
     * @description Given filters, provides list of payouts for a balance account
     */
    get: operations["getPayouts"];
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    /** @description Net amount */
    Amount: {
      /** @description The three-character [ISO currency code](https://docs.adyen.com/development-resources/currency-codes). */
      currency: string;
      /**
       * Format: int64
       * @description The amount of the transaction, in [minor units](https://docs.adyen.com/development-resources/currency-codes).
       */
      value: number;
    };
    AmountGroupedDTO: {
      amount?: components["schemas"]["Amount"];
      category?: string;
    };
    /** @description Payouts made within the filters provided for given balanceAccountId */
    PayoutDTO: {
      /** @description BalanceAccount ID */
      balanceAccountId: string;
      chargesAmount: components["schemas"]["Amount"];
      /**
       * Format: date-time
       * @description Date created
       */
      createdAt: string;
      grossAmount: components["schemas"]["Amount"];
      /** @description ID */
      id: string;
      netAmount: components["schemas"]["Amount"];
    };
    PayoutResponseDTO: {
      amountBreakdown?: components["schemas"]["AmountGroupedDTO"][];
      payout?: components["schemas"]["PayoutDTO"];
    };
    /** @description Links */
    PayoutsLinks: {
      next: components["schemas"]["PayoutsNextLink"];
      prev: components["schemas"]["PayoutsPrevLink"];
    };
    /** @description Link to next page */
    PayoutsNextLink: {
      /** @description Cursor for next page */
      cursor: string;
    };
    /** @description Link to previous page */
    PayoutsPrevLink: {
      /** @description Cursor for previous page */
      cursor: string;
    };
    PayoutsResponseDTO: {
      _links: components["schemas"]["PayoutsLinks"];
      /** @description Payouts made within the filters provided for given balanceAccountId */
      data: components["schemas"]["PayoutDTO"][];
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type $defs = Record<string, never>;

export type external = Record<string, never>;

export interface operations {

  /**
   * Get payout details
   * @description Given a payout ID, it retrieves its details
   */
  getPayout: {
    parameters: {
      path: {
        payoutId: string;
      };
    };
    responses: {
      /** @description OK - the request has succeeded. */
      200: {
        content: {
          "application/json": components["schemas"]["PayoutResponseDTO"];
        };
      };
    };
  };
  /**
   * Get payouts
   * @description Given filters, provides list of payouts for a balance account
   */
  getPayouts: {
    parameters: {
      query: {
        balanceAccountId: string;
        createdSince?: string;
        createdUntil?: string;
        cursor?: string;
        limit?: number;
      };
    };
    responses: {
      /** @description OK - the request has succeeded. */
      200: {
        content: {
          "application/json": components["schemas"]["PayoutsResponseDTO"];
        };
      };
    };
  };
}

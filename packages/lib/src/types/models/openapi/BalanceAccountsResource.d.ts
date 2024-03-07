/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/v1/balanceAccounts": {
    /**
     * Get all balance accounts of an account holder
     * @description Provides list of balance accounts to select
     */
    get: operations["getBalanceAccounts"];
  };
  "/v1/balanceAccounts/{balanceAccountId}/balances": {
    /**
     * Get all balances of a balance account
     * @description Provides balances of a balance account in different currencies
     */
    get: operations["getBalances"];
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    /** @description List of balance accounts */
    BalanceAccountBase: {
      /**
       * @description The default three-character [ISO currency code](https://docs.adyen.com/development-resources/currency-codes) of the balance account.
       * The default value is **EUR**.
       * > After a balance account is created, you cannot change its default currency.
       */
      defaultCurrencyCode: string;
      /** @description A human-readable description of the balance account, maximum 300 characters. You can use this parameter to distinguish between multiple balance accounts under an account holder. */
      description?: string;
      /** @description The unique identifier of the balance account. */
      id: string;
      /**
       * @description The time zone of the balance account. For example, **Europe/Amsterdam**.
       * Defaults to the time zone of the account holder if no time zone is set. For possible values, see the [list of time zone codes](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).
       */
      timeZone: string;
    };
    BalanceAccountsResponse: {
      /** @description List of balance accounts */
      balanceAccounts: components["schemas"]["BalanceAccountBase"][];
    };
    /** @description Collection of balances per balance account */
    Balance: {
      /** @description ISO currency code */
      currency: string;
      /**
       * Format: int64
       * @description Balance amount value in a given currency
       */
      value: number;
    };
    BalancesResponse: {
      /** @description Collection of balances per balance account */
      balances: components["schemas"]["Balance"][];
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
   * Get all balance accounts of an account holder
   * @description Provides list of balance accounts to select
   */
  getBalanceAccounts: {
    responses: {
      /** @description OK - the request has succeeded. */
      200: {
        content: {
          "application/json": components["schemas"]["BalanceAccountsResponse"];
        };
      };
    };
  };
  /**
   * Get all balances of a balance account
   * @description Provides balances of a balance account in different currencies
   */
  getBalances: {
    parameters: {
      path: {
        balanceAccountId: string;
      };
    };
    responses: {
      /** @description OK - the request has succeeded. */
      200: {
        content: {
          "application/json": components["schemas"]["BalancesResponse"];
        };
      };
    };
  };
}

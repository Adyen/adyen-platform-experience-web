/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
    "/v1/balanceAccounts/transactions/{transactionId}": {
        /** @description Add @Operation annotation to provide a description */
        get: operations["getTransaction"];
    };
    "/v1/balanceAccounts/{balanceAccountId}/transactions/totals": {
        /** @description Add @Operation annotation to provide a description */
        get: operations["getTransactionTotals"];
    };
    "/v1/balanceAccounts/{balanceAccountId}/transactions": {
        /** @description Add @Operation annotation to provide a description */
        get: operations["getTransactions"];
    };
}

export type webhooks = Record<string, never>;

export interface components {
    schemas: {
        /** @description Amount */
        Amount: {
            /** @description The three-character [ISO currency code](https://docs.adyen.com/development-resources/currency-codes). */
            currency: string;
            /**
             * Format: int64
             * @description The amount of the transaction, in [minor units](https://docs.adyen.com/development-resources/currency-codes).
             */
            value: number;
        };
        /** @description Information about the bank account */
        BankAccount: {
            /** @description Last four digits of the account number or IBAN. */
            accountNumberLastFourDigits: string;
        };
        /** @enum {string} */
        Category: "ATM" | "Capital" | "Correction" | "Fee" | "Payment" | "Refund" | "Chargeback" | "Transfer" | "Other";
        /** @description Payment method or payment instrument */
        PaymentMethod: {
            /** @description Last four digits of the card */
            lastFourDigits?: string;
            /** @description Payment method type code of the transaction f.e. klarna, visa, mc */
            type: string;
        };
        /** @description Transactions made within the filters provided for given balanceAccountId */
        SingleTransaction: {
            amount: components["schemas"]["Amount"];
            bankAccount?: components["schemas"]["BankAccount"];
            category: components["schemas"]["Category"];
            /**
             * Format: date-time
             * @description Date created
             */
            creationDate: string;
            /** @description ID */
            id: string;
            paymentMethod: components["schemas"]["PaymentMethod"];
            status: components["schemas"]["Status"];
        };
        /** @enum {string} */
        Status: "Pending" | "Booked" | "Rejected";
        /** @description Collection of transaction totals per currency */
        TransactionTotal: {
            /** @description ISO currency code */
            currency: string;
            /**
             * Format: int64
             * @description Sum of expenses of transactions (negative transaction amount values)
             */
            expenses: number;
            /**
             * Format: int64
             * @description Sum of incomings of transactions (positive transaction amount values)
             */
            incomings: number;
        };
        TransactionTotalsResponse: {
            /** @description Collection of transaction totals per currency */
            totals: components["schemas"]["TransactionTotal"][];
        };
        TransactionsResponse: {
            /** @description Cursor for next page */
            next: string;
            /** @description Cursor for previous page */
            prev: string;
            /** @description Transactions made within the filters provided for given balanceAccountId */
            transactions: components["schemas"]["SingleTransaction"][];
        };
        /** @enum {string} */
        SortDirection: "asc" | "desc";
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
    /** @description Add @Operation annotation to provide a description */
    getTransaction: {
        parameters: {
            path: {
                transactionId: string;
            };
        };
        responses: {
            /** @description OK - the request has succeeded. */
            200: {
                content: {
                    "application/json": components["schemas"]["SingleTransaction"];
                };
            };
        };
    };
    /** @description Add @Operation annotation to provide a description */
    getTransactionTotals: {
        parameters: {
            query: {
                createdSince: string;
                createdUntil: string;
                categories?: components["schemas"]["Category"][];
                statuses?: components["schemas"]["Status"][];
            };
            path: {
                balanceAccountId: string;
            };
        };
        responses: {
            /** @description OK - the request has succeeded. */
            200: {
                content: {
                    "application/json": components["schemas"]["TransactionTotalsResponse"];
                };
            };
        };
    };
    /** @description Add @Operation annotation to provide a description */
    getTransactions: {
        parameters: {
            query?: {
                cursor?: string;
                createdSince?: string;
                createdUntil?: string;
                categories?: components["schemas"]["Category"][];
                currencies?: string[];
                statuses?: components["schemas"]["Status"][];
                sortDirection?: components["schemas"]["SortDirection"];
                limit?: number;
            };
            path: {
                balanceAccountId: string;
            };
        };
        responses: {
            /** @description OK - the request has succeeded. */
            200: {
                content: {
                    "application/json": components["schemas"]["TransactionsResponse"];
                };
            };
        };
    };
}

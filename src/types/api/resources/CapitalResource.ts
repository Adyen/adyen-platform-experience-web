/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
    '/v1/capital/grantOffers/dynamic': {
        /**
         * Get Dynamic Grant Offer
         * @description Get grant offer details for specific parameters
         */
        get: operations['getDynamicGrantOffer'];
    };
    '/v1/capital/grantOffers/dynamic/configuration': {
        /**
         * Get dynamic offers
         * @description Given dynamic offers for the account holder
         */
        get: operations['getDynamicGrantOffersConfiguration'];
    };
    '/v1/capital/grantOffers/review': {
        /**
         * Review Grant Offer
         * @description This action verifies offer conditions and makes grant ready for user to accept it
         */
        post: operations['reviewGrantOffer'];
    };
    '/v1/capital/grants': {
        get: operations['getGrants'];
    };
    '/capital/grantOffers/dynamic/sign/{grantOfferId}': {
        post: operations['signOffer'];
    };
}

export type webhooks = Record<string, never>;

export interface components {
    schemas: {
        Amount: {
            /** @description The three-character [ISO currency code](https://docs.adyen.com/development-resources/currency-codes). */
            currency: string;
            /**
             * Format: int64
             * @description The amount of the transaction, in [minor units](https://docs.adyen.com/development-resources/currency-codes).
             */
            value: number;
        };
        GrantOfferResponseDTO: {
            /** Format: int32 */
            expectedRepaymentPeriodDays: number;
            feesAmount: components['schemas']['Amount'];
            grantAmount: components['schemas']['Amount'];
            id?: string;
            /** Format: int32 */
            maximumRepaymentPeriodDays?: number;
            /** Format: int32 */
            repaymentRate?: number;
            thresholdAmount: components['schemas']['Amount'];
            totalAmount: components['schemas']['Amount'];
        };
        GrantDTO: {
            id: string;
            grantAmount: {
                value: number;
                currency: string;
            };
            feesAmount: {
                value: number;
                currency: string;
            };
            repayedAmount: {
                value: number;
                currency: string;
            };
            repayedGrantAmount: {
                value: number;
                currency: string;
            };
            repayedFeesAmount: {
                value: number;
                currency: string;
            };
            repaymentAmount: {
                value: number;
                currency: string;
            };
            thresholdPaymentAmount: {
                value: number;
                currency: string;
            };

            repaymentRate: number;
            expectedRepaymentPeriodDays: number;
            repaymentPeriodLeft: number;
            maximumRepaymentPeriodDays: number;
            status: components['schemas']['GrantStatus'];
        };
        GrantStatus: 'Pending' | 'Active' | 'Repaid' | 'Failed' | 'WrittenOff' | 'Revoked';
        DynamicOffersResponseDTO: {
            maxAmount: components['schemas']['Amount'];
            minAmount: components['schemas']['Amount'];
            /** Format: int32 */
            step: number;
        };
        ReviewGrantOfferRequestDTO: {
            /** Format: int64 */
            amount: number;
            currency: string;
        };
        signOffer: components['schemas']['GrantDTO'];
        getGrants: { data: components['schemas']['GrantDTO'][] };
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
     * Get Dynamic Grant Offer
     * @description Get grant offer details for specific parameters
     */
    getDynamicGrantOffer: {
        parameters: {
            query: {
                amount: number;
                currency: string;
            };
        };
        responses: {
            /** @description OK - the request has succeeded. */
            200: {
                content: {
                    'application/json': components['schemas']['GrantOfferResponseDTO'];
                };
            };
        };
    };
    /**
     * Get dynamic offers
     * @description Given dynamic offers for the account holder
     */
    getDynamicGrantOffersConfiguration: {
        responses: {
            /** @description OK - the request has succeeded. */
            200: {
                content: {
                    'application/json': components['schemas']['DynamicOffersResponseDTO'];
                };
            };
        };
    };
    /**
     * Review Grant Offer
     * @description This action verifies offer conditions and makes grant ready for user to accept it
     */
    reviewGrantOffer: {
        requestBody: {
            content: {
                'application/json': components['schemas']['ReviewGrantOfferRequestDTO'];
            };
        };
        responses: {
            /** @description OK - the request has succeeded. */
            200: {
                content: {
                    'application/json': components['schemas']['GrantOfferResponseDTO'];
                };
            };
        };
    };
    getGrants: {
        responses: {
            /** @description OK - the request has succeeded. */
            200: {
                content: {
                    'application/json': components['schemas']['getGrants'];
                };
            };
        };
    };
    signOffer: {
        parameters: {
            path: {
                grantOfferId: string;
            };
        };
        responses: {
            /** @description OK - the request has succeeded. */
            200: {
                content: {
                    'application/json': components['schemas']['signOffer'];
                };
            };
        };
    };
}

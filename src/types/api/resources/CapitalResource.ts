export interface paths {
    '/v1/capital/grantOffers/dynamic/configuration': {
        get: operations['getConfiguration'];
    };
    '/v1/capital/grantOffers/dynamic': {
        get: operations['dynamicGrantOffer'];
    };
    '/v1/capital/grantOffers/review': {
        post: operations['getGrantOfferReview'];
    };
    '/capital/grantOffers/dynamic/sign/{grantOfferId}': {
        post: operations['signOffer'];
    };
    '/v1/capital/grants': {
        get: operations['getGrants'];
    };
}
export interface operations {
    /**
     * Get reports
     * @description Given filters, provides list of reports for a balance account
     */
    getConfiguration: {
        responses: {
            /** @description OK - the request has succeeded. */
            200: {
                content: {
                    'application/json': components['schemas']['configuration'];
                };
            };
        };
    };
    getGrantOfferReview: {
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
                    'application/json': components['schemas']['getGrantOfferReview'];
                };
            };
        };
    };
    dynamicGrantOffer: {
        responses: {
            /** @description OK - the request has succeeded. */
            200: {
                content: {
                    'application/json': components['schemas']['dynamicGrantOffer'];
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
}

export interface components {
    schemas: {
        /** @description Reports made within the filters provided for given balanceAccountId */
        grantOfferDTO: {
            id: string;
            amount: {
                value: number;
                currency: string;
            };
            fees: {
                value: number;
                currency: string;
            };
            totalAmount: {
                value: number;
                currency: string;
            };
            thresholdAmount: {
                value: number;
                currency: string;
            };
            repaymentRate: number;
            expectedRepaymentPeriodDays: number;
            maximumRepaymentPeriodDays: number;
        };

        configuration: {
            minAmount: {
                value: number;
                currency: string;
            };
            maxAmount: {
                value: number;
                currency: string;
            };
            step: number;
        };
        getGrantOfferReview: components['schemas']['grantOfferDTO'];
        dynamicGrantOffer: components['schemas']['grantOfferDTO'];
        signOffer: {
            id: string;
            grantAmount: {
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
            feesAmount: {
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
            maximumRepaymentPeriodDays: number;
            repaymentPeriodLeft: number;
            status: 'Pending' | 'Booked' | 'Reversed';
        };
        getGrants: components['schemas']['grantOfferDTO'][];
        DownloadReportResponseDTO: Uint8Array;
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}

export type $defs = Record<string, never>;

export type external = Record<string, never>;

export type webhooks = Record<string, never>;

export interface paths {
    "/v1/reports": {
        /**
         * Get reports
         * @description Given filters, provides list of reports for a balance account
         */
        get: operations["getReports"];
    };
}

export type webhooks = Record<string, never>;

export interface components {
    schemas: {
        /** @description Reports made within the filters provided for given balanceAccountId */
        ReportsDTO: {
            /**
             * Format: date-time
             * @description Date created
             */
            createdAt: string;
            /**
             * Format: string
             * @description Name of the report
             */
            name?: string;
        };
        /** @description Link to a different page */
        Link: {
            /** @description Cursor for a different page */
            cursor: string;
        };
        /** @description Links */
        Links: {
            next: components["schemas"]["Link"];
            prev: components["schemas"]["Link"];
        };
        ReportsResponseDTO: {
            _links: components["schemas"]["Links"];
            /** @description Reports made within the filters provided for given balanceAccountId */
            data: components["schemas"]["ReportsDTO"][];
        };
        DownloadReportResponseDTO: {
            data: Uint8Array;
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
     * Get reports
     * @description Given filters, provides list of reports for a balance account
     */
    getReports: {
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
                    "application/json": components["schemas"]["ReportsResponseDTO"];
                };
            };
        };
    };
    downloadReport: {
        parameters: {
            query: {
                balanceAccountId: string;
                createdAt?: string;
            };
        };
        responses: {
            /** @description OK - the request has succeeded. */
            200: {
                content: {
                    "text/csv": components["schemas"]["DownloadReportResponseDTO"];
                };
            };
        };
    }
}

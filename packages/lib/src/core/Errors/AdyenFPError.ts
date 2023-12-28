class AdyenFPError extends Error {
    public type: string;
    public static errorTypes = {
        /** Network error. */
        NETWORK_ERROR: 'NETWORK_ERROR',

        /** Shopper canceled the current transaction. */
        CANCEL: 'CANCEL',

        /** Implementation error. The method or parameter are incorrect or are not supported. */
        IMPLEMENTATION_ERROR: 'IMPLEMENTATION_ERROR',

        /** Generic error. */
        ERROR: 'ERROR',

        /** Token expired */
        EXPIRED_TOKEN: 'EXPIRED_TOKEN',
    };

    constructor(type: keyof typeof AdyenFPError.errorTypes, message?: string) {
        super(message);

        this.type = AdyenFPError.errorTypes[type];
        this.name = AdyenFPError.errorTypes[type];
    }
}

export default AdyenFPError;

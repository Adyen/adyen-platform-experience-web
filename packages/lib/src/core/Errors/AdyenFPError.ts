import { ErrorTypes } from '@src/core/Services/requests/utils';

class AdyenFPError extends Error {
    public type: string;

    constructor(type: ErrorTypes, message?: string) {
        super(message);
        this.type = type;
        this.name = type;
    }
}

export default AdyenFPError;

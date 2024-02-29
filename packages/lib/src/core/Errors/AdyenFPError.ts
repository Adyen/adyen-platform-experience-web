import { ErrorTypes } from '@src/core/Services/requests/utils';

class AdyenFPError extends Error {
    public type: string;
    public errorCode?: string;
    constructor(type: ErrorTypes, message?: string, errorCode?: string) {
        super(message);
        this.type = type;
        this.name = type;
        this.errorCode = errorCode;
    }
}

export default AdyenFPError;

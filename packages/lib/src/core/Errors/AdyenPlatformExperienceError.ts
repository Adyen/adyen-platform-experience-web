import { ErrorTypes } from '@src/core/Services/requests/utils';

class AdyenPlatformExperienceError extends Error {
    public type: string;
    public errorCode?: string;
    public requestId?: string;
    constructor(type: ErrorTypes, requestId?: string, message?: string, errorCode?: string) {
        super(message);
        this.type = type;
        this.name = type;
        this.errorCode = errorCode;
        this.requestId = requestId;
    }
}

export default AdyenPlatformExperienceError;

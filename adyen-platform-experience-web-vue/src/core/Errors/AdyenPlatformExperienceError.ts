import { ErrorTypes } from '../Http/utils';
export type InvalidField = { name: string; message: string; value: string };

class AdyenPlatformExperienceError extends Error {
    public type: string;
    public errorCode?: string;
    public requestId?: string;
    public invalidFields?: InvalidField[];
    public status?: string;
    constructor(type: ErrorTypes, requestId?: string, message?: string, errorCode?: string, invalidFields?: InvalidField[], status?: string) {
        super(message);
        this.type = type;
        this.name = type;
        this.errorCode = errorCode;
        this.requestId = requestId;
        this.invalidFields = invalidFields;
        this.status = status;
    }
}

export default AdyenPlatformExperienceError;

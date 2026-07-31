type InvalidField = {
    name: string;
};

export type PaymentLinksErrorMetadata = {
    errorCode?: string;
    requestId?: string;
    invalidFields?: InvalidField[];
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

export const getPaymentLinksErrorMetadata = (error: Error | undefined): PaymentLinksErrorMetadata => {
    if (!error || !isRecord(error)) return {};

    const invalidFields = Array.isArray(error.invalidFields)
        ? error.invalidFields.flatMap(field => (isRecord(field) && typeof field.name === 'string' ? [{ name: field.name }] : []))
        : undefined;

    return {
        errorCode: typeof error.errorCode === 'string' ? error.errorCode : undefined,
        requestId: typeof error.requestId === 'string' ? error.requestId : undefined,
        invalidFields,
    };
};

export const toError = (value: unknown): Error => {
    if (value instanceof Error) return value;

    const error = new Error(isRecord(value) && typeof value.message === 'string' ? value.message : undefined);
    return isRecord(value) ? Object.assign(error, value) : error;
};

export const createPaymentLinksError = (message: string, metadata: PaymentLinksErrorMetadata): Error => Object.assign(new Error(message), metadata);

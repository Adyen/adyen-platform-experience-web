import type { IPaymentLinkCreateRequest } from '@integration-components/types';
import type { PaymentLinkCreationFormValues, PaymentLinkFieldName } from './types';

export type PaymentLinkFlatValues = Record<string, unknown>;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date);

export const flattenValues = (source: unknown, prefix = ''): PaymentLinkFlatValues => {
    const result: PaymentLinkFlatValues = {};
    if (!isPlainObject(source)) return result;

    Object.entries(source).forEach(([key, value]) => {
        const path = prefix ? `${prefix}.${key}` : key;
        if (isPlainObject(value)) {
            Object.assign(result, flattenValues(value, path));
        } else {
            result[path] = value;
        }
    });

    return result;
};

const setNestedValue = (target: Record<string, unknown>, path: string, value: unknown) => {
    const segments = path.split('.');
    let cursor = target;
    segments.forEach((segment, index) => {
        if (index === segments.length - 1) {
            cursor[segment] = value;
            return;
        }
        if (!isPlainObject(cursor[segment])) cursor[segment] = {};
        cursor = cursor[segment] as Record<string, unknown>;
    });
};

export const unflattenValues = (flat: PaymentLinkFlatValues): Record<string, unknown> => {
    const result: Record<string, unknown> = {};
    Object.entries(flat).forEach(([path, value]) => {
        if (value === undefined) return;
        setNestedValue(result, path, value);
    });
    return result;
};

const coerceNumericValue = (value: unknown): number => {
    const numeric = typeof value === 'number' ? value : parseFloat(`${value}`);
    return Number.isFinite(numeric) ? numeric : 0;
};

/**
 * Builds the create-payment-link payload from the flat form values, keeping only the fields
 * that come back from the configuration endpoint (plus visibility-included fields) and dropping
 * the synthetic `store` field, which is sent as a path parameter instead.
 */
export const buildApiPayload = (
    flat: PaymentLinkFlatValues,
    includedFields: PaymentLinkFieldName[]
): { store: string; payload: IPaymentLinkCreateRequest } => {
    const picked: PaymentLinkFlatValues = {};
    includedFields.forEach(field => {
        if (field === 'store') return;
        const value = flat[field];
        if (value === undefined || value === '') return;
        picked[field] = field === 'amount.value' || field === 'linkValidity.quantity' ? coerceNumericValue(value) : value;
    });

    return {
        store: `${flat.store ?? ''}`,
        payload: unflattenValues(picked) as IPaymentLinkCreateRequest,
    };
};

export const buildSummaryValues = (flat: PaymentLinkFlatValues): Partial<PaymentLinkCreationFormValues> =>
    unflattenValues(flat) as Partial<PaymentLinkCreationFormValues>;

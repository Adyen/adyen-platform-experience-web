import { RefundType, type TransactionDetails } from './types';

export const getAmountStyleForTransaction = (transaction?: TransactionDetails) => {
    switch (transaction?.status) {
        case 'Booked':
            return 'default';
        case 'Reversed':
            return 'error';
        default:
            return 'pending';
    }
};

export const getTagVariantForTransaction = (transaction?: TransactionDetails): string => {
    switch (transaction?.status) {
        case 'Booked':
            return 'success';
        case 'Reversed':
            return 'error';
        default:
            return 'default';
    }
};

export const getRefundTypeForTransaction = (transaction?: TransactionDetails): RefundType | undefined => {
    if (transaction?.category === 'Refund') {
        const refundType = transaction.refundMetadata?.refundType;
        switch (refundType) {
            case RefundType.FULL:
                return RefundType.FULL;
            case RefundType.PARTIAL:
                return RefundType.PARTIAL;
        }
    }
};

/**
 * Normalize custom fields with remaps, similar to the Preact normalizeCustomFields util.
 */
export function normalizeCustomFields(
    fields: Record<string, any> | undefined,
    remaps: Record<string, string | ((tx?: any) => string | undefined)>,
    data?: any
): { key: string; visibility?: string }[] | undefined {
    if (!fields) return undefined;

    return Object.entries(fields).map(([key, config]) => {
        const remap = remaps[key];
        let resolvedKey = key;

        if (typeof remap === 'string') {
            resolvedKey = remap;
        } else if (typeof remap === 'function') {
            const result = remap(data);
            if (result) resolvedKey = result;
        }

        return {
            key: resolvedKey,
            visibility: config?.visibility,
            ...config,
        };
    });
}

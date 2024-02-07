import { PageNeighbour, PaginatedResponseDataWithLinks } from '../../../internal/Pagination/types';
import { ITransaction } from '../../../../types';

const labels = {
    id: 'paymentId',
    type: 'type',
    creationDate: 'date',
    balanceAccountId: 'balanceAccount',
    accountHolderId: 'account',
    fee: 'txType.Fee',
    capture: 'txType.capture',
    leftover: 'txType.leftover',
    manualCorrection: 'txType.manualCorrection',
    internalTransfer: 'txType.internalTransfer',
    balanceAdjustment: 'txType.balanceAdjustment',
    amount: 'txAmount',
    description: 'description',
    status: 'status',
    category: 'category',
    paymentMethod: 'paymentMethod',
    currency: 'currency',
} as const;
export const getLabel = (key: keyof typeof labels) => {
    return labels[key] || key;
};

export const getCursor = (dir: PageNeighbour, transactions: PaginatedResponseDataWithLinks<ITransaction, 'data'>): string | null => {
    try {
        if (transactions._links?.[dir]?.href) {
            const url = new URL(transactions?._links?.[dir]?.href ?? '');
            return url.searchParams.get('cursor');
        }
    } catch (e) {
        console.error(e);
    }
    return null;
};

export const getRequestParams = (transactions: PaginatedResponseDataWithLinks<ITransaction, 'data'>) => {
    try {
        const links = transactions?._links || {};
        const link = links['prev'] || links['next'];
        if (link?.href) {
            const url = new URL(link.href);
            const { cursor, ...params } = Object.fromEntries(url.searchParams);
            return params;
        }
    } catch (e) {
        console.error(e);
    }
    return null;
};

const PAYMENT_METHODS = Object.freeze({
    klarna: 'Klarna',
    paypal: 'PayPal',
});

export function parsePaymentMethodType(paymentMethod: ITransaction['paymentMethod']) {
    if (paymentMethod.lastFourDigits) return paymentMethod.lastFourDigits;

    return PAYMENT_METHODS[paymentMethod.type as keyof typeof PAYMENT_METHODS] || paymentMethod.type;
}

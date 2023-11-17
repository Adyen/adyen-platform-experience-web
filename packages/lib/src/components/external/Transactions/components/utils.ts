import { PageNeighbour, PaginatedResponseDataWithLinks } from '../../../internal/Pagination/types';
import { ITransaction } from '../../../../types';

const labels = {
    id: 'paymentId',
    type: 'transactionType',
    createdAt: 'creationTime',
    balanceAccountId: 'balanceAccount',
    accountHolderId: 'account',
    fee: 'txType.fee',
    capture: 'txType.capture',
    leftover: 'txType.leftover',
    manualCorrection: 'txType.manualCorrection',
    internalTransfer: 'txType.internalTransfer',
    balanceAdjustment: 'txType.balanceAdjustment',
    amount: 'amount',
    description: 'description',
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

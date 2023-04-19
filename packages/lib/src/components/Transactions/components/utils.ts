import { TransactionsPageProps } from '../types';
import { PageNeighbours } from '../../../hooks/usePaginatedRecords';

export const getLabel = (key: string) => {
    const labels: Record<string, string> = {
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
    };

    return labels[key] || key;
};

export const getCursor = (dir: PageNeighbours, transactions: TransactionsPageProps['transactions']): string | null => {
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

export const getRequestParams = (transactions: TransactionsPageProps['transactions']) => {
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

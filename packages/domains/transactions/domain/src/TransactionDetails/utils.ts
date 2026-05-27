import { EMPTY_OBJECT } from '@integration-components/utils';
import { RefundType, TransactionDetails } from './types';

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

export const getRefundTypeForTransaction = (transaction?: TransactionDetails) => {
    if (transaction?.category === 'Refund') {
        const { refundType } = transaction.refundMetadata ?? (EMPTY_OBJECT as NonNullable<TransactionDetails['refundMetadata']>);
        switch (refundType) {
            case RefundType.FULL:
                return RefundType.FULL;
            case RefundType.PARTIAL:
                return RefundType.PARTIAL;
        }
    }
};

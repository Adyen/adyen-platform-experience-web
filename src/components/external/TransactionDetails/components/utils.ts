import { EMPTY_OBJECT } from '../../../../utils';
import { RefundType } from '../context/types';
import { TagVariant } from '../../../internal/Tag/types';
import type { TransactionDetailData } from '../types';

export const getAmountStyleForTransaction = (transaction: TransactionDetailData) => {
    switch (transaction?.status) {
        case 'Booked':
            return 'default';
        case 'Reversed':
            return 'error';
        default:
            return 'pending';
    }
};

export const getTagVariantForTransaction = (transaction: TransactionDetailData) => {
    switch (transaction?.status) {
        case 'Booked':
            return TagVariant.SUCCESS;
        case 'Reversed':
            return TagVariant.ERROR;
        default:
            return TagVariant.DEFAULT;
    }
};

export const getRefundTypeForTransaction = (transaction: TransactionDetailData) => {
    if (transaction.category === 'Refund') {
        const { refundType } = transaction.refundMetadata ?? (EMPTY_OBJECT as NonNullable<TransactionDetailData['refundMetadata']>);
        switch (refundType) {
            case RefundType.FULL:
                return RefundType.FULL;
            case RefundType.PARTIAL:
                return RefundType.PARTIAL;
        }
    }
};
